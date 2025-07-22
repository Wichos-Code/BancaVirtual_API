import User from "../user/user.model.js"
import Account from "../account/account.model.js"

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

export const accountExists = async (id = " ") => {
    const existe = await Account.findById(id)
    if (!existe) {
        throw new Error("No existe la Cuenta con el ID proporcionado")
    }
}