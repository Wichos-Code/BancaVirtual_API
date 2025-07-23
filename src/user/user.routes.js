import { Router } from "express";
import { getUsers, createUserAdmin, updateUserA, deleteUserA, getUser, getProfileInfo, updateUser } from "./user.controller.js";
import { getUsersValidator, createUserAdminValidator, updateUserAValidator, deleteUserAValidator, getUserValidator, getProfileInfoValidator, updateUserValidator } from "../middlewares/user-validator.js";

const router = Router()

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtiene todos los usuarios activos
 *     tags:
 *       - Usuarios (Admin)
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *       404:
 *         description: No se encontraron usuarios
 */
router.get(
    "/users",
    getUsersValidator,
    getUsers
)

router.post(
    "/createUser", // Ruta específica para que el admin cree usuarios
    createUserAdminValidator, // Un middleware de validación para esta ruta (opcional pero recomendado)
    createUserAdmin
);

/**
 * @swagger
 * /update/{dpi}:
 *   put:
 *     summary: Actualiza datos de un usuario (solo admin, excepto admin y campos restringidos)
 *     tags:
 *       - Usuarios (Admin)
 *     parameters:
 *       - in: path
 *         name: dpi
 *         schema:
 *           type: string
 *         required: true
 *         description: DPI del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado con éxito
 *       402:
 *         description: No puedes editar campos restringidos o usuario administrador
 *       500:
 *         description: Error al actualizar usuario
 */
router.put(
    "/update/:dpi",
    updateUserAValidator,
    updateUserA
)

/**
 * @swagger
 * /delete/{dpi}:
 *   delete:
 *     summary: Elimina (soft delete) un usuario (solo admin, excepto admin)
 *     tags:
 *       - Usuarios (Admin)
 *     parameters:
 *       - in: path
 *         name: dpi
 *         schema:
 *           type: string
 *         required: true
 *         description: DPI del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado con éxito
 *       402:
 *         description: No puedes eliminar un usuario administrador
 *       500:
 *         description: Error al eliminar usuario
 */
router.delete(
    "/delete/:dpi",
    deleteUserAValidator,
    deleteUserA
)

/**
 * @swagger
 * /search/{dpi}:
 *   get:
 *     summary: Busca un usuario por DPI
 *     tags:
 *       - Usuarios (Admin)
 *     parameters:
 *       - in: path
 *         name: dpi
 *         schema:
 *           type: string
 *         required: true
 *         description: DPI del usuario a buscar
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al buscar usuario
 */
router.get(
    "/search/:dpi",
    getUserValidator,
    getUser
)

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Obtiene el perfil del usuario autenticado
 *     tags:
 *       - Usuarios (Usuario)
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al obtener el perfil
 */
router.get(
    "/profile",
    getProfileInfoValidator,
    getProfileInfo
)

/**
 * @swagger
 * /update:
 *   put:
 *     summary: Actualiza datos del usuario autenticado (campos restringidos)
 *     tags:
 *       - Usuarios (Usuario)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Datos actualizados con éxito
 *       402:
 *         description: No puedes editar campos restringidos
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error al actualizar perfil
 */
router.put(
    "/update",
    updateUserValidator,
    updateUser
)

export default router