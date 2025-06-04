import Account from "./account.model.js";
import User from "../user/user.model.js";

const generateRandomAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

export const createAccount = async (req, res) => {
    try {
        const data = req.body;
        const user = req.usuario;

        data.user = user._id;

        let newAccountNumber;
        let exist = true;

        while (exist) {
            newAccountNumber = generateRandomAccountNumber();
            const existingAccount = await Account.findOne({ noAccount: newAccountNumber });

            if (!existingAccount) {
                exist = false;
            }
        }
        data.noAccount = newAccountNumber;

        const newAccount = new Account(data);
        await newAccount.save();

        res.status(201).json({
            success: true,
            message: "Cuenta creada correctamente",
            account: newAccount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear la cuenta",
            error: error.message,
        });
    }
}

export const getMyAccount = async (req, res) => {
    try {
        const user = req.usuario;
        const accounts = await Account.find({ user: user._id }).populate("user", "name email");

        res.status(200).json({
            success: true,
            accounts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las cuentas",
            error: error.message,
        });
    }
}
export const getAccountById = async (req, res) => {
    try {
        const { id } = req.params
        const account = await Account.findById(id)
            .populate("user", "name email");

        return res.status(200).json({
            success: true,
            account
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al obtener la cuenta",
            error: err.message
        })
    }
}

export const getAllAccounts = async (req, res) => {
    try {
        const user = req.usuario;

        if (user.role !== "ADMIN_ROLE" && user.role !== "SUPERVISOR_ROLE") {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para realizar esta acción",
            });
        }
        const accounts = await Account.find().populate("user", "name email");

        res.status(200).json({
            success: true,
            accounts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener todas las cuentas",
            error: error.message,
        });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const { id } = req.params
        const account = await Account.findById(id)

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "cuenta no encontrada"
            });
        }
        if (account.status == "false") {
            return res.status(400).json({
                success: false,
                message: "La cuenta ya ha sido eliminada previamente"

            });
        }

        const updateAccount = await Account.findByIdAndUpdate(id, { status: false }, { new: true })

        return res.status(200).json({
            success: true,
            message: "Cuenta eliminada correctamente",
            account: updateAccount
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error al eliminar la cuenta",
            error: err.message
        })
    }
}
