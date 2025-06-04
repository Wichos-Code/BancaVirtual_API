import User from "./user.model.js"

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