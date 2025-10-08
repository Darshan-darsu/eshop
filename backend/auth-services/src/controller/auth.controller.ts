import { Request, Response, NextFunction } from "express";
import {
  validateRegistrationData,
  checkOtpRestriction,
  trackOtpRestriction,
  sendOtp,
  verifyOtp,
  handleForgotPassword,
  verifyuserForgotPasswordOtp
} from "../utils/auth.helper";
import { AuthError, ValidationError, prisma } from "@eshop/common";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { setCookie } from "../utils/cookies/setCookies";

const SaltRounds=10
const userType='user'
// Register new user
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body, "data");
    validateRegistrationData(req.body, "user");
    const { name, email, password, phone_number, country } = req.body;

    const exisitingUser = await prisma.users.findUnique({
      where: { email: email },
    });
    if (exisitingUser) {
      return next(new ValidationError("User with this email already exists"));
    }
    await checkOtpRestriction(email, next);
    await trackOtpRestriction(email, next);
    await sendOtp(
      name, 
      email, 
      "user-activation-email"
    );

    return res.status(200).json({
      message: "Otp send to email. Please verify the account",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify the user otp
export const verifyUser=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {email,otp,password,name}=req.body;
    if(!email || !otp || !password ||!name){
      return next(new ValidationError("All fields are mandate"))
    }

    const userExist=await prisma.users.findUnique({where:{email}});
    if(userExist){
      return next(new ValidationError("User Already exist"))
    }

    await verifyOtp(email,otp,next)
    const hassPassword=await bcrypt.hash(password,SaltRounds)
    const addUser=await prisma.users.create({
      data:{
        name,email,password:hassPassword
      }
    })
    res.status(200).json({success:true,message:'User successfully registered.'})
  } catch (error) {
    console.log("Error in verify user",error)
    return next(error)
  }
}

// Login user
export const loginUser=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {email,password}=req.body
    const user=await prisma.users.findUnique({where:{email}})
    if (!user){
      return next(new AuthError("User does not exist"))
    }
    const isMatched=await bcrypt.compare(password,user.password!)
    if(!isMatched){
      return next( new AuthError("Invalid email or password"))
    }
    const accessToken=jwt.sign({id:user.id,role:"user"},process.env.ACCESSTOKEN_SECRET as string,{expiresIn:"15min"})
    const refreshToken=jwt.sign({id:user.id,role:"user"},process.env.REFRESHTOKEN_SECRET as string,{expiresIn:"7d"})
    setCookie(res,"refresh_token",refreshToken)
    setCookie(res,"access_token",accessToken)

    res.status(200).json({
      success:true,
      message:"Login Successfull!",
      user:{id:user.id,email:user.email,name:user.name}
    })
  } catch (error) {
    console.log("Login Error",error)
    return next(error)
  }
}

// User forgot password
export const userForgotPassword=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    await handleForgotPassword(req,res,next,userType)
  } catch (error) {
    console.log("User Forgot Password",error)
    return next(error)
  }
}


// User forgot password
export const verifyuserForgotPassword=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    await verifyuserForgotPasswordOtp(req,res,next)
  } catch (error) {
    console.log("User Forgot Password",error)
    return next(error)
  }
}

export const resetUserPassword=async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {email,password}=req.body;
    if(!email || !password){
      return next(new ValidationError("All fields are mandate"))
    }
    const user=await prisma.users.findUnique({where:{email}})
    if(!user){
      return next(new AuthError("User does not exist"))
    }
    const isSamePassword=await bcrypt.compare(password,user.password!)
    if(isSamePassword){
      return next(new ValidationError("New password cannot be same as old password"))
    }

    const hashedPassword=await bcrypt.hash(password,SaltRounds)
    const updateUser=await prisma.users.update({where:{email},data:{password:hashedPassword}})
    res.status(200).json({
      success:true,
      message:"User password updated!"
    })

  } catch (error) {
    console.log("User Forgot Password",error)
    return next(error)
  }
}
