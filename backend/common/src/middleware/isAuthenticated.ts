import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../libs/prisma";

interface AuthRequest extends Request {
  user?: any;
  role?: any;
  seller?: any;
}

const isAuthenticated = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies["access_token"] ||
      req.cookies["seller_access_token"] ||
      req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized! Token is missing" });
    }
    // verify token
    const decoded = jwt.verify(token, process.env.ACCESSTOKEN_SECRET!) as {
      id: string;
      role: "user" | "seller";
    };
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorize token is invalid" });
    }

    let account;
    if (decoded.role == "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
      req.user = account;
    } else if (decoded.role == "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: { shop: true },
      });
      req.seller = account;
    }
    req.role = decoded.role;
    if (!account) {
      return res.status(401).json({ message: "Account not found" });
    }
    return next();
  } catch (error) {
    console.log("error in common middleware", error);
    return res.status(401).json({ message: "Something went wrong" });
  }
};

export default isAuthenticated;
