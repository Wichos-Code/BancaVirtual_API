import { Router } from "express"
import { createAccount, getAccountById, getMyAccount, getAllAccounts, deleteAccount, deposit, getMyNoAccount, getAccountTransactions } from "./account.controller.js"
import { createAccountValidator, getAccountByIdValidator, getAccountsValidator, getMyAccountsValidator, deleteAccountValidator, depositAccountValidator } from "../middlewares/account-validator.js"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: API for managing bank accounts
 */

/**
 * @swagger
 * /createAccount:
 *   post:
 *     summary: Create a new bank account
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [Monetary, Savings]
 *                 example: "Monetary"
 *               currency:
 *                 type: string
 *                 enum: [USD, EUR, GTQ, MXN, COP, ARS, JPY, GBP]
 *                 example: "USD"
 *     responses:
 *       201:
 *         description: Account created successfully
 *       400:
 *         description: Invalid data or missing information
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/createAccount", createAccountValidator, createAccount)
/**
 * @swagger
 * /getAccountsById/{id}:
 *   get:
 *     summary: Get account details by account ID
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the account
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 account:
 *                   type: object
 *                   properties:
 *                     noAccount:
 *                       type: number
 *                       example: 1234567890
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *                     amount:
 *                       type: number
 *                       example: 1000
 *                     type:
 *                       type: string
 *                       example: "Monetary"
 *                     status:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */

router.get("/getAccountsById/:id", getAccountByIdValidator, getAccountById)

/**
 * @swagger
 * /getMyAccounts:
 *   get:
 *     summary: Get all accounts of the authenticated user
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       noAccount:
 *                         type: number
 *                         example: 1234567890
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       amount:
 *                         type: number
 *                         example: 1000
 *                       type:
 *                         type: string
 *                         example: "Monetary"
 *                       status:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get("/getMyAccounts", getMyAccountsValidator, getMyAccount)

/**
 * @swagger
 * /getAllAccounts:
 *   get:
 *     summary: Get all accounts (admin/supervisor only)
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all accounts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accounts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       noAccount:
 *                         type: number
 *                         example: 1234567890
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       amount:
 *                         type: number
 *                         example: 1000
 *                       type:
 *                         type: string
 *                         example: "Monetary"
 *                       status:
 *                         type: boolean
 *                         example: true
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "John Doe"
 *                           email:
 *                             type: string
 *                             example: "john@example.com"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */

router.get("/getAllAccounts", getAccountsValidator, getAllAccounts)

/**
 * @swagger
 * /deleteAccount/{id}:
 *   delete:
 *     summary: Delete an account by ID (admin/supervisor only)
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the account
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */

router.delete("/deleteAccount/:id", deleteAccountValidator, deleteAccount)

/**
 * @swagger
 * /createDeposit:
 *   post:
 *     summary: Make a deposit/transfer between accounts
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAccount:
 *                 type: number
 *                 description: Origin account number
 *                 example: 1234567890
 *               toAccount:
 *                 type: number
 *                 description: Destination account number
 *                 example: 9876543210
 *               amount:
 *                 type: number
 *                 description: Amount to deposit/transfer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Deposit completed successfully
 *       400:
 *         description: Invalid data or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */

router.post("/createDeposit", depositAccountValidator, deposit)

/**
 * @swagger
 * /getByMyNoAccount:
 *   post:
 *     summary: Get your own account by account number
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               noAccount:
 *                 type: number
 *                 description: Your account number
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: Account retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */

router.post("/getByMyNoAccount", getMyAccountsValidator, getMyNoAccount)

/**
 * @swagger
 * /getDepositHistory:
 *   post:
 *     summary: Get the deposit/transaction history for one of your accounts
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountNo:
 *                 type: number
 *                 description: Your account number to get the transaction history
 *                 example: 1234567890
 *     responses:
 *       200:
 *         description: List of transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fromAccount:
 *                         type: number
 *                         example: 1234567890
 *                       toAccount:
 *                         type: number
 *                         example: 9876543210
 *                       amount:
 *                         type: number
 *                         example: 100
 *                       type:
 *                         type: string
 *                         example: "DEPOSIT"
 *                       currency:
 *                         type: string
 *                         example: "USD"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-04T12:00:00Z"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Account not found or does not belong to you
 *       500:
 *         description: Internal server error
 */


router.post("/getDepositHistory", getMyAccountsValidator, getAccountTransactions)

export default router