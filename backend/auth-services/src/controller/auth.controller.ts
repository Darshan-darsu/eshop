import { Request, Response, NextFunction } from "express";
import {
  validateRegistrationData,
  checkOtpRestriction,
  trackOtpRestriction,
  sendOtp,
  verifyOtp,
  handleForgotPassword,
  verifyuserForgotPasswordOtp,
} from "../utils/auth.helper";
import { AuthError, ValidationError, prisma } from "@eshop/common";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookies";
import Stripe from "stripe";

const SaltRounds = 10;
const userType = "user";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});
interface AuthRequest extends Request {
  user?: any;
}

interface AuthSellerRequest extends Request {
  seller?: any;
}

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
    await sendOtp(name, email, "user-activation-email");

    return res.status(200).json({
      message: "Otp send to email. Please verify the account",
    });
  } catch (error) {
    return next(error);
  }
};

// Verify the user otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are mandate"));
    }

    const userExist = await prisma.users.findUnique({ where: { email } });
    if (userExist) {
      return next(new ValidationError("User Already exist"));
    }

    await verifyOtp(email, otp, next);
    const hassPassword = await bcrypt.hash(password, SaltRounds);
    const addUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hassPassword,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "User successfully registered." });
  } catch (error) {
    console.log("Error in verify user", error);
    return next(error);
  }
};

// Login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User does not exist"));
    }
    const isMatched = await bcrypt.compare(password, user.password!);
    if (!isMatched) {
      return next(new AuthError("Invalid email or password"));
    }
    res.clearCookie("seller_refresh_token")
    res.clearCookie("seller_access_token")
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESSTOKEN_SECRET as string,
      { expiresIn: "15min" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESHTOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      success: true,
      message: "Login Successfull!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Login Error", error);
    return next(error);
  }
};

// User forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await handleForgotPassword(req, res, next, userType);
  } catch (error) {
    console.log("User Forgot Password", error);
    return next(error);
  }
};

// User forgot password
export const verifyuserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyuserForgotPasswordOtp(req, res, next);
  } catch (error) {
    console.log("User Forgot Password", error);
    return next(error);
  }
};

export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("All fields are mandate"));
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("User does not exist"));
    }
    const isSamePassword = await bcrypt.compare(password, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError("New password cannot be same as old password")
      );
    }

    const hashedPassword = await bcrypt.hash(password, SaltRounds);
    const updateUser = await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });
    res.status(200).json({
      success: true,
      message: "User password updated!",
    });
  } catch (error) {
    console.log("User Forgot Password", error);
    return next(error);
  }
};

export const refreshToken = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refresh_token"] || req.cookies["seller_refresh_token"];
    if (!refreshToken) {
      return new ValidationError("Unauthorized! No refresh token");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESHTOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden Invalid Refresh Token");
    }

    let account;
    if (decoded.role === "user") {
      account = await prisma.users.findUnique({ where: { id: decoded.id } });
    } else if (decoded.role == "seller") {
      account = await prisma.sellers.findUnique({ where: { id: decoded.id } });
    }

    if (!account) {
      return new AuthError("Forbidden User/Seller are not found");
    }

    const newAccessToken = jwt.sign(
      { id: account.id, role: decoded.role },
      process.env.ACCESSTOKEN_SECRET as string,
      { expiresIn: "15min" }
    );
        if (decoded.role == "user") {
      setCookie(res, "access_token", newAccessToken);
    } else if (decoded.role == "seller") {
      setCookie(res, "seller_access_token", newAccessToken);
    }
    const newRefreshToken = jwt.sign(
      { id: account.id, role: decoded.role },
      process.env.REFRESHTOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    if (decoded.role == "user") {
      setCookie(res, "refresh_token", newRefreshToken);
    } else if (decoded.role == "seller") {
      setCookie(res, "seller_refresh_token", newRefreshToken);
    }
    req.role=decoded.role
    return res.status(201).json({ success: true });
  } catch (error) {
    console.log(error, "Error in refresh token");
    return next(error);
  }
};

export const getUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await req.user;
    res.status(201).json({ user, success: true });
  } catch (error) {
    console.log(error, "error in getuser");
    return next(error);
  }
};

// ---------------- Seller ---------------------------------------------//
export const registerSeller = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const exisitingUser = await prisma.sellers.findUnique({
      where: { email: email },
    });
    if (exisitingUser) {
      return next(new ValidationError("Seller with this email already exists"));
    }
    await checkOtpRestriction(email, next);
    await trackOtpRestriction(email, next);
    await sendOtp(name, email, "seller-activation-email");

    return res.status(200).json({
      message: "Otp send to email. Please verify the account",
    });
  } catch (error) {
    console.log(error, "register seler error");
  }
};

export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
      return next(new ValidationError("All fields are mandate"));
    }

    const userExist = await prisma.sellers.findUnique({ where: { email } });
    if (userExist) {
      return next(new ValidationError("User Already exist"));
    }

    await verifyOtp(email, otp, next);
    const hassPassword = await bcrypt.hash(password, SaltRounds);
    const addSeller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hassPassword,
        phone_number,
        country,
      },
    });
    res
      .status(200)
      .json({
        success: true,
        message: "Seller successfully registered.",
        seller: addSeller,
      });
  } catch (error) {
    console.log("Error in verify seller", error);
    return next(error);
  }
};

export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.sellers.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError("Sellers does not exist"));
    }
    const isMatched = await bcrypt.compare(password, user.password!);
    if (!isMatched) {
      return next(new AuthError("Invalid email or password"));
    }
    res.clearCookie("access_token")
    res.clearCookie("refresh_token")
    const accessToken = jwt.sign(
      { id: user.id, role: "seller" },
      process.env.ACCESSTOKEN_SECRET as string,
      { expiresIn: "15min" }
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "seller" },
      process.env.REFRESHTOKEN_SECRET as string,
      { expiresIn: "7d" }
    );
    setCookie(res, "seller_refresh_token", refreshToken);
    setCookie(res, "seller_access_token", accessToken);
  
    res.status(200).json({
      success: true,
      message: "Login Successfull!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.log("Login Error", error);
    return next(error);
  }
};

export const getSeller = async (
  req: AuthSellerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req,'req')
    const seller = await req.seller;
    res.status(201).json({ seller, success: true });
  } catch (error) {
    console.log(error, "error in getuser");
    return next(error);
  }
};

// --------------------- Create A Shop -----------------

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      bio,
      category,
      coverBanner,
      address,
      opening_hours,
      website,
      socialLinks,
      sellerId,
    } = req.body;

    if (!name || !bio || !category || !address || !sellerId || !opening_hours) {
      return next(new ValidationError("All fields are mandate"));
    }
    const shopData: any = {
      name,
      bio,
      category,
      address,
      sellerId,
      opening_hours,
    };
    if (website && website.trim() !== "") {
      shopData.website = website;
    }
    const addShop = await prisma.shops.create({ data: shopData });
    res.status(201).json({ success: true, shop: addShop });
  } catch (error) {
    console.log("Error in create shop", error);
    return next(error);
  }
};

//---------------------------Connect Stripe ----------------

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("sellerId is mandate"));
    }
    const seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    if (!seller) {
      return next(new ValidationError("seller does not exist"));
    }
    const account = await stripe.accounts.create({
      type: "express",
      email: seller.email,
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prisma.sellers.update({
      where: { id: sellerId },
      data: { stripeId: account.id },
    });
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:3000/success",
      return_url: "http://localhost:3000/success",
      type: "account_onboarding",
    });
    res.status(201).json({ success: true, url: accountLink.url });
  } catch (error) {
    console.log("Error in create stripe", error);
    return next(error);
  }
};
