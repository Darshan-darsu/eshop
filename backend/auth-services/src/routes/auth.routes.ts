import express ,{Router} from "express"
import { createShop, createStripeConnectLink, getSeller, getUser, loginSeller, loginUser, refreshToken, registerSeller, resetUserPassword, userForgotPassword, userRegister,verifySeller,verifyUser, verifyuserForgotPassword } from "../controller/auth.controller"
import { isAuthenticated, isSeller, isUser } from "@eshop/common";



const router:Router=express.Router();

router.post("/user-register",userRegister)
router.post("/verify-user",verifyUser)
router.post("/login-user",loginUser)
router.get("/logged-in-user",isAuthenticated,isUser,getUser)
router.post("/forgot-password-user",userForgotPassword)
router.post("/reset-password-user",resetUserPassword)
router.post("/verify-password-user",verifyuserForgotPassword)

// Refresh token
router.post("/refresh-token",refreshToken)

// Seller registration
router.post("/seller-register",registerSeller)
router.post("/verify-seller",verifySeller)
router.post("/login-seller",loginSeller)
router.get("/logged-in-seller",isAuthenticated,isSeller,getSeller)

// Shop
router.post("/create-shop",createShop)

// Stripe
router.post("/create-stripe-link",createStripeConnectLink)

export default router