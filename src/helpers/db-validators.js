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

export const accountExist = async(noAccount = '') => {
    const existe = await Account.findOne({noAccount})
    if (existe) {
        throw new Error(`La cuenta ${noAccount} ya fue registrado previamente`)
    }
}