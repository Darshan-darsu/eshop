import { Request,Response,NextFunction } from "express";
import { AuthError } from "../error-middleware/error-handler";


interface AuthRequest extends Request {
    role?:any
}

export const isSeller=(req:AuthRequest,res:Response,next:NextFunction)=>{
    if(req.role!=="seller"){
        return next(new AuthError("Access denied: Seller Only "))
    }
    next()
}


export const isUser=(req:AuthRequest,res:Response,next:NextFunction)=>{
    if(req.role!=="user"){
        return next(new AuthError("Access denied: Seller Only "))
    }
    next()
}