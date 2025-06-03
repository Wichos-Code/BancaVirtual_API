import User from "../user/user.model.js"

export const emailExist = async(email = '') =>{
    const existe = await User.findOne({email})
    if(existe){
        throw new Error(`El email ${email} ya fue registrado previamente`)
    }
}

export const usernameExist = async(username = '') =>{
    const existe = await User.findOne({username})
    if(existe){
        throw new Error(`El email ${username} ya fue registrado previamente`)
    }
}

export const validateIncome = async(income) => {
    if(income < 100 ) {
        throw new Error("Usuario rechazado para el banco por ingresos")
    }
}