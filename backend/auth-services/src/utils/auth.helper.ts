import crypto from "crypto"
import {AuthError, ValidationError,prisma,redis} from "@eshop/common";
import { sendEmail } from "./SendMail";
import { Request,Response,NextFunction } from "express";

const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailSubject="Verify your email"

export const validateRegistrationData=(data:any,userType:"user"|"seller")=>{
    const {name,email,password,phone_number,country}=data

    if(!name || !email || !password || (userType==='seller' && (!phone_number || !country))){
        console.log(userType,'usertype')
        throw new ValidationError("Missing required fields for registration")
    }
    if (emailRegex.test(email)===false){
        throw new ValidationError("Invalid email format")
    }
}

export const checkOtpRestriction=async(email:string,next:NextFunction)=>{
    const otpLock=await redis.get(`otp_lock:${email}`)
    if(otpLock){
        return next(new ValidationError("Account is locked due to multiple failed OTP attempts. Try again 30 mins later"))
    }

    const otpSpam=await redis.get(`otp_spam_lock:${email}`)
    if(otpSpam){
        return next(new ValidationError("Too many OTP requests . please wait 1 hr before requesting again."))
    }
    const otpCoolDown=await redis.get(`otp_cool_down:${email}`)
    if(otpCoolDown){
        return next(new ValidationError("Please wait for 1 min before try again"));
    }

}

export const sendOtp=async(name:string,email:string,template:string)=>{
    const otp=crypto.randomInt(1000,9999).toString();
    await sendEmail(email,emailSubject,template,{name,otp})
    await redis.set(`otp:${email}`,otp,"EX",300);
    await redis.set(`otp_cooldown:${email}`,email,"EX", 600);

}

export const trackOtpRestriction=async(email:string,next:NextFunction)=>{
    const requestCount=parseInt(await redis.get(`otp_request_count:${email}`) || "0")
    if (requestCount>=2){
        await redis.set(`otp_spam_locked:${email}`,"locked","EX","3600");
        return  next(new ValidationError("Too many OTP request"))
    }
    await redis.set(`otp_request_count:${email}`,requestCount+1,"EX",3600)
}

export const verifyOtp=async(email:String,otp:Number,next:NextFunction)=>{
try {
    const userOtp=parseInt(await redis.get(`otp:${email}`) || "0000")
    if(!userOtp){
        throw new ValidationError("Invalid or expired otp")
    }
    const failedAttemptsKey=`otp_attempts:${email}`
    const failedAttemptS=parseInt(await redis.get(failedAttemptsKey) || "0")
    if (String(userOtp)!==String(otp)){
        if(failedAttemptS>=2){
           await redis.set(`otp_lock:${email}`,"locked","EX",1800)
           await redis.del(`otp:${email}`,String(failedAttemptS))
           throw new ValidationError("Too many failed attempts. Try again after 30min")
        }
        await redis.set(failedAttemptsKey,failedAttemptS+1,"EX",300)
        throw new ValidationError(`Invalid OTP. ${2 - failedAttemptS} left`)
    }  
    await redis.del(`otp:${email}`,failedAttemptsKey)
} catch (error) {
    console.log("Error in veirfy otp:",error)
    return next(error)
    
}
}

export const handleForgotPassword=async(req:Request,res:Response,next:NextFunction,userType:"user" | "seller")=>{
    try {
        const {email}=req.body;
        if(!email){
            return next(new ValidationError("All fields are required"));
        }
        const user=userType =="user" ?await prisma.users.findUnique({where:{email}}) : await prisma.sellers.findUnique({where:{email}})
        if(!user){
            return next(new AuthError("User does not exist"));
        }
        await checkOtpRestriction(email,next)
        await trackOtpRestriction(email,next)
        await sendOtp(user.name,email,userType=="user"?"forgot-password-user-mail":"forgot-password-seller-mail")
        res.status(200).json({success:true,message:"Otp sent to your email. please verify your account"})
    } catch (error) {
        console.log("Error in handleForgotPassword ",error)
    }
}

export const verifyuserForgotPasswordOtp=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {email,otp}=req.body
        if (!email || !otp ){
            return next(new ValidationError("All fields are mandate"))
        }
        await verifyOtp(email,otp,next)
        res.status(200).json({
            success:true,
            message:"Otp has been verified and please reset password now."
        })
        
    } catch (error) {
          console.log("Error in verifyuserForgotPasswordOtp ",error)
    }
}
