import { Router } from "express";
import { register, verifyEmail, login } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/user-validator.js";

const router = Router()

router.post(
    "/register",
    registerValidator, 
    register
)

router.get("/verify/:code", verifyEmail)

router.post("/login",loginValidator,login )

export default router