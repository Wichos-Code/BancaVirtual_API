import { body, param } from "express-validator";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js"
import { hasRoles } from "./role-validator.js";
import { accountExists } from "../helpers/db-validators.js";

export const createAccountValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
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
    body("myAccountNo").isNumeric().withMessage("El número de cuenta debe ser numérico"),
    body("favoriteAccountId").isMongoId().withMessage("No es un ID válido de MongoDB"),
    validateFields,
    handleErrors
]

export const mostActiveAccountsValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]

export const accountDetailsForAdminValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]

export const reverseDepositValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE", "SUPERVISOR_ROLE"),
    validateFields,
    handleErrors
]