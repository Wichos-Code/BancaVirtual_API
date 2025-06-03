import { body } from "express-validator";
import { emailExist, usernameExist } from "../helpers/db-validators.js";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";

export const registerValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    body("name", "El nombre es obligatorio").not().isEmpty(),
    body("surname", "El apellido es obligatorio").not().isEmpty(),
    body("username","El username es obligatorio").not().isEmpty(),
    body("dpi", "El No. de DPI es obligatorio").not().isEmpty(),
    body("email", "El correo es obligatorio").not().isEmpty(),
    body("email", "Ingrese un correo válido").isEmail(),  
    body("email").custom(emailExist),
    body("username").custom(usernameExist),
    body("password").isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0
    }),
    validateFields,
    handleErrors
]

export const loginValidator = [
    body("dpi").isNumeric().withMessage("No es un DPI válido"),
    body("password").isLength({ min: 4 }).withMessage("El password debe contener al menos 8 caracteres"),
    validateFields,
    handleErrors
];