import { Router } from "express";
import { getUsers, updateUserA } from "./user.controller.js";
import { getUsersValidator, updateUserAValidator } from "../middlewares/user-validator.js";

const router = Router()

router.get(
    "/users",
    getUsersValidator,
    getUsers
)


router.put(
    "/update/:dpi",
    updateUserAValidator,
    updateUserA
)

export default router