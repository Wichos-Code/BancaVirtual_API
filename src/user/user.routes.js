import { Router } from "express";
import { getUsers, updateUserA, deleteUserA } from "./user.controller.js";
import { getUsersValidator, updateUserAValidator, deleteUserAValidator } from "../middlewares/user-validator.js";

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

router.delete(
    "/delete/:dpi",
    deleteUserAValidator,
    deleteUserA
)

export default router