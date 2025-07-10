import { body, param } from "express-validator";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js"
import { hasRoles } from "./role-validator.js";
import { accountExists } from "../helpers/db-validators.js";

export const createAccountValidator = [
    validateJWT,
    hasRoles("CLIENT_ROLE"),
    body("type").notEmpty().withMessage("Debes de seleccionar un tipo de cuenta"),
    body("currency").notEmpty().withMessage("Debes de seleccionar el tipo de moneda"),
    validateFields,
    handleErrors,
]

export const getMyAccountsValidator = [
    validateJWT,
    hasRoles("CLIENT_ROLE"),
    validateFields,
    handleErrors
]

export const getAccountsValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]

export const getAccountByIdValidator = [
    validateJWT,
    param("id").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("id").custom(accountExists),
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]

export const deleteAccountValidator = [
    validateJWT,
    param("id").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("id").custom(accountExists),
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]

export const depositAccountValidator = [
    validateJWT,
    hasRoles("CLIENT_ROLE"),
    validateFields,
    handleErrors
]

export const getFavoritesValidator = [
    validateJWT,
    validateFields,
    handleErrors
]

export const addFavorite = [
    validateJWT,
    body(" myAccountNo").isMongoId().withMessage("No es un ID válido de MongoDB"),
    body("favoriteAccountId").isMongoId().withMessage("No es un ID válido de MongoDB"),
    validateFields,
    handleErrors
]