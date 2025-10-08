import express ,{Router} from "express"
import { loginUser, resetUserPassword, userForgotPassword, userRegister,verifyUser, verifyuserForgotPassword } from "../controller/auth.controller"

const router:Router=express.Router();

router.post("/user-register",userRegister)
router.post("/verify-user",verifyUser)
router.post("/login-user",loginUser)
router.post("/forgot-password-user",userForgotPassword)
router.post("/reset-password-user",resetUserPassword)
router.post("/verify-password-user",verifyuserForgotPassword)

export default router