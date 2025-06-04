import { Router } from "express";
import { getUsers, updateUserA, deleteUserA, getUser } from "./user.controller.js";
import { getUsersValidator, updateUserAValidator, deleteUserAValidator, getUserValidator } from "../middlewares/user-validator.js";

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

router.get(
    "/search/:dpi",
    getUserValidator,
    getUser
)

export default router