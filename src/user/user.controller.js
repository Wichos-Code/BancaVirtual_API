import User from "./user.model.js"

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