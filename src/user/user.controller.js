import User from "./user.model.js"
import { hash } from "argon2";
// FUNCIONES PARA ADMINISTRADORES

export const getUsers = async (req,res) => {
    try {
        const users = await User.find({status: true})

        if(!users || users.length === 0){
            return res.status(404).json({
                message: "No se encontraron usuarios"
            })
        }

        return res.status(200).json({
            message: "Usuarios obtenidos con exito",
            user: users
        })

    } catch (err) {
        return res.status(500).json({
            message: "Error al encontrar usuarios",
            error: err.message
        })
    }
}

export const createUserAdmin = async (req, res) => {
    try {
        const data = req.body;

        // Validaciones básicas antes de proceder
        if (!data.username || !data.email || !data.password || !data.dpi || !data.name || !data.surname) {
            return res.status(400).json({ message: "Campos obligatorios faltantes." });
        }

        // Verificar si el username o email ya existen
        const existingUserByUsername = await User.findOne({ username: data.username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: "El nombre de usuario ya existe." });
        }
        const existingUserByEmail = await User.findOne({ email: data.email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }
        const existingUserByDpi = await User.findOne({ dpi: data.dpi });
        if (existingUserByDpi) {
            return res.status(400).json({ message: "El DPI ya está registrado." });
        }


        const encryptedPassword = await hash(data.password);
        data.password = encryptedPassword;

        // Si el admin crea el usuario, el status puede ser true por defecto
        // Y no se necesita token de verificación
        data.status = true; // El admin lo activa directamente
        data.verificationToken = undefined;
        data.verificationTokenExpiresAt = undefined;

        // Asegurarse de que el rol enviado sea uno de los válidos en el enum
        const validRoles = ["ADMIN_ROLE", "CLIENT_ROLE", "SUPERVISOR_ROLE"];
        if (data.role && !validRoles.includes(data.role)) {
            return res.status(400).json({ message: "Rol inválido." });
        }
        // Si no se envía un rol, el modelo de usuario asignará CLIENT_ROLE por defecto

        const newUser = await User.create(data);

        return res.status(201).json({
            message: "Usuario creado por administrador con éxito",
            user: newUser
        });

    } catch (err) {
        console.error("Error al crear usuario por administrador:", err.message);
        return res.status(500).json({
            message: "Error al crear usuario por administrador",
            error: err.message
        });
    }
};

export const getUser = async(req,res) => {
    const { dpi } = req.params
    try {
        const user = await User.findOne({dpi: dpi})

        if(!user){
            return res.status(404).json({
                message: "No se encontraron usuario"
            })
        }

        return res.status(200).json({
            message: "Usuario obtenido con exito",
            user: user
        })

    } catch (err) {
        return res.status(500).json({
            message: "Error al encontrar usuario",
            error: err.message
        })
    }
}

export const updateUserA = async(req, res) => {
    const { dpi } = req.params
    const data = req.body
    try {
        const user = await User.findOne({dpi: dpi})
        if(user.role === "ADMIN_ROLE") {
            return res.status(402).json({
                message: "No puedes editar un usuario administrador"
            })
        }
        if(data.dpi) {
            return res.status(402).json({
                message: "No puedes editar el DPI"
            })
        }
        if(data.password) {
            return res.status(402).json({
                message: "No puedes editar la contraseña"
            })
        }

        const userUpdate = await User.findByIdAndUpdate(user._id, data, {new: true})

        return res.status(200).json({
            message: "Usuario actualizado con exito",
            userUpdate
        })

    } catch (err) {
        return res.status(500).json({
            message: "Error al actualizar usuario",
            error: err.message
        })
    }
}

export const deleteUserA = async(req,res) => {
    const { dpi } = req.params
    try {
        const user = await User.findOne({dpi: dpi})
        if(user.role === "ADMIN_ROLE") {
            return res.status(402).json({
                message: "No puedes editar un usuario administrador"
            })
        }

        const userDelete = await User.findByIdAndUpdate(user._id, {status: false}, {new: true})

        return res.status(200).json({
            message: "Usuario eliminado con exito",
            userDelete
        })
    } catch (err) {
        return res.status(500).json({
            message: "Error al eliminar usuario"
        })
    }
}

// FUNCIONES PARA USUARIOS

export const getProfileInfo = async (req, res) => {
    const usuario = req.usuario;
    try {
        const user = await User.findById(usuario._id).select("-password -verificationToken -verificationTokenExpiresAt -uid -status -role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Perfil obtenido correctamente",
            user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener el perfil",
            error: err.message,
        });
    }
};

export const updateUser = async (req, res) => {
    const usuario = req.usuario
    const data = req.body
    try {
        const user = await User.findById(usuario._id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }
        if(data.username) {
            return res.status(402).json({
                success: false,
                message: "No puedes editar el username"
            })
        }
        if(data.password){
            return res.status(402).json({
                success: false,
                message: "No puedes editar tu contraseña"
            })
        }
        if(data.dpi){
            return res.status(402).json({
                success: false,
                message: "No puedes editar el No. de DPI"
            })
        }
        if(data.email){
            return res.status(402).json({
                success: false,
                message: "No puedes editar el correo"
            })
        }
        if(data.phone){
            return res.status(402).json({
                success: false,
                message: "No puedes editar el No. de telefono"
            })
        }
        if(data.role){
            return res.status(402).json({
                success: false,
                message: "No puedes editar el role"
            })
        }
        if(data.status){
            return res.status(402).json({
                success: false,
                message: "No puedes editar el status"
            })
        }

        const userUpdate = await User.findByIdAndUpdate(user._id, data, {new:true})
        .select("-password -verificationToken -verificationTokenExpiresAt -uid -status -role")

        return res.status(200).json({
            message: "Datos actualizados con exito",
            userUpdate
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al actualizar perfil",
            error: err.message
        })
    }
}