import { Router } from "express"
import { createAccount, getAccountById, getMyAccount, getAllAccounts, deleteAccount } from "./account.controller.js"
import { createAccountValidator, getAccountByIdValidator, getAccountsValidator, getMyAccountsValidator, deleteAccountValidator } from "../middlewares/account-validator.js"

const router = Router()


router.post("/createAccount", createAccountValidator, createAccount)

router.get("/getAccountsById/:id", getAccountByIdValidator, getAccountById)

router.get("/getMyAccounts", getMyAccountsValidator, getMyAccount)

router.get("/getAllAccounts", getAccountsValidator, getAllAccounts)

router.delete("/deleteAccount/:id", deleteAccountValidator, deleteAccount)

export default router