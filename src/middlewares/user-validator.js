import { body, param, check } from "express-validator";
import { emailExist, usernameExist, validateIncome } from "../helpers/db-validators.js";
import { validateFields } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";
import { hasRoles } from "./role-validator.js";

import User from '../user/user.model.js';

export const registerValidator = [
    body("name", "El nombre es obligatorio").not().isEmpty(),
    body("surname", "El apellido es obligatorio").not().isEmpty(),
    body("username","El username es obligatorio").not().isEmpty(),
    body("dpi", "El No. de DPI es obligatorio").not().isEmpty(),
    body("direction", "La dirección es obligatorio").not().isEmpty(),
    body("email", "El correo es obligatorio").not().isEmpty(),
    body("email", "Ingrese un correo válido").isEmail(),  
    body("email").custom(emailExist),
    body("username").custom(usernameExist),
    body("income").custom(validateIncome),
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
    body("username", "Username en formato erróneo").optional().isString(),
    body("dpi", "No es un DPI válido").optional().isNumeric(),
    body("password").isLength({ min: 4 }).withMessage("El password debe contener al menos 8 caracteres"),
    validateFields,
    handleErrors
];


export const getUsersValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    validateFields,
    handleErrors
]

export const createUserAdminValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('surname', 'El apellido es obligatorio').not().isEmpty(),
    check('username', 'El nombre de usuario es obligatorio').not().isEmpty(),
    check('username').custom(async (username) => {
        // Validación para asegurarse que el username no exista (puedes moverla al controller si prefieres)
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            throw new Error('El nombre de usuario ya existe');
        }
    }),
    check('password', 'La contraseña es obligatoria y debe tener al menos 8 caracteres').isLength({ min: 8 }),
    check('dpi', 'El DPI es obligatorio y debe ser un número').not().isEmpty().isNumeric(),
    check('email', 'El email es obligatorio y debe ser un formato válido').isEmail(),
    check('email').custom(async (email) => {
        // Validación para asegurarse que el email no exista
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('El email ya está registrado');
        }
    }),
    check('direction', 'La dirección es obligatoria').not().isEmpty(),
    check('income', 'Los ingresos mensuales son obligatorios y deben ser un número positivo').isFloat({ min: 0 }),
    check('phone', 'El teléfono debe tener 8 dígitos si se proporciona').optional().isLength({ min: 8, max: 8 }),
    check('workName', 'El nombre del trabajo es obligatorio').not().isEmpty(),
    check('role', 'El rol es obligatorio y debe ser ADMIN_ROLE, CLIENT_ROLE o SUPERVISOR_ROLE').isIn(['ADMIN_ROLE', 'CLIENT_ROLE', 'SUPERVISOR_ROLE']),
    validateFields,
    handleErrors
];

export const updateUserAValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("dpi", "No es un DPI válido").optional().isNumeric(),
    validateFields,
    handleErrors
]

export const deleteUserAValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    param("dpi", "No es un DPI válido").optional().isNumeric(),
    validateFields,
    handleErrors
]

export const getUserValidator = [
    validateJWT,
    hasRoles("ADMIN_ROLE"),
    validateFields,
    handleErrors
]

export const getProfileInfoValidator = [
    validateJWT,
    validateFields,
    handleErrors
]

export const updateUserValidator = [
    validateJWT,
    hasRoles("CLIENT_ROLE"),
    validateFields,
    handleErrors
]