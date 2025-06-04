import { Router } from "express";
import { getUsers } from "./user.controller.js";
import { getUsersValidator } from "../middlewares/user-validator.js";

const router = Router()

router.get(
    "/users",
    getUsersValidator,
    getUsers
)


export default router