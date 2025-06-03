import { Router } from "express";
import { register, verifyEmail, login } from "./auth.controller.js";
import { registerValidator, loginValidator } from "../middlewares/user-validator.js";

const router = Router()

/**
 * @swagger
 * /virtualBank/v1/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - username
 *               - dpi
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan
 *               surname:
 *                 type: string
 *                 example: Pérez
 *               username:
 *                 type: string
 *                 example: juanperez
 *               dpi:
 *                 type: number
 *                 example: 1234567890123
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userDetails:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: string
 *                     email:
 *                       type: string
 *       500:
 *         description: Error al registrar al usuario
 */
router.post(
    "/register",
    registerValidator, 
    register
);

/**
 * @swagger
 * /virtualBank/v1/auth/verify/{code}:
 *   get:
 *     summary: Verifica el correo electrónico del usuario
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de verificación enviado al correo
 *     responses:
 *       200:
 *         description: Cuenta verificada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/verify/:code", verifyEmail);

/**
 * @swagger
 * /virtualBank/v1/auth/login:
 *   post:
 *     summary: Inicia sesión con DPI y contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dpi
 *               - password
 *             properties:
 *               dpi:
 *                 type: number
 *                 example: 1234567890123
 *               password:
 *                 type: string
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userDetails:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     name:
 *                       type: string
 *                     surname:
 *                       type: string
 *       400:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error al iniciar sesión, error del servidor
 */
router.post("/login",loginValidator,login )

export default router