import { body } from "express-validator";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js"
import { hasRoles } from "./role-validator.js";
import { accountExist } from "../helpers/db-validators.js";

export const createAccountValidator = [
    validateJWT,
    hasRoles("CLIENT_ROLE"),
    body("type").notEmpty().withMessage("Debes de seleccionar un tipo de cuenta"),
    body("currency").notEmpty().withMessage("Debes de seleccionar el tipo de moneda"),
    validateFields,
    handleErrors,
]