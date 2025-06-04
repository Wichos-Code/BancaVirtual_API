import Account from "./account.model.js";
import Transaction from "../transaction/transaction.model.js";

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
            //Por medio de la funcion anterior generamos un numero de cuenta aleatorio
            newAccountNumber = generateRandomAccountNumber();
            //Verificamos si el numero de cuenta existe en la base de datos
            const existingAccount = await Account.findOne({ noAccount: newAccountNumber });

            //Si el numero de cuenta no existe en la db salimos del bucle.
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

export const getMyNoAccount = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const { noAccount } = req.body;

        //Funcionalidad para ver la cuenta del usuario registrado por número de cuenta
        const originAccount = await Account.findOne({
            noAccount: noAccount,
            user: userId,
            status: true
        });

        if (!originAccount) {
            return res.status(404).json({ error: "Tu cuenta de origen no fue encontrada o no está activa" });
        }

        res.status(200).json({
            success: true,
            originAccount,
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

export const transaction = async (req, res) => {
    const userId = req.usuario.id;
    const { fromAccount, toAccount, amount } = req.body;

    // Verifico que los datos recibidos en el cuerpo de la solicitud sean válidos
    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        return res.status(400).json({ error: "Datos inválidos para el depósito" });
    }

    try {
        //Con esto evitamos que una persona transfiera dinero a su misma cuenta.
        if (fromAccount === toAccount) {
            return res.status(400).json({ error: "No puedes transferir dinero a la misma cuenta" });
        }

        // Se busca la cuenta de origen del usuario para verificar que exista y esté activa
        const originAccount = await Account.findOne({
            noAccount: fromAccount,
            user: userId,
            status: true
        });

        if (!originAccount) {
            return res.status(404).json({ error: "Tu cuenta de origen no fue encontrada o no está activa" });
        }

        if (originAccount.amount < amount) {
            return res.status(400).json({ error: "Fondos insuficientes en la cuenta de origen" });
        }

        const targetAccount = await Account.findOne({
            noAccount: toAccount,
            status: true
        });

        if (!targetAccount) {
            return res.status(404).json({ error: "Cuenta de destino no encontrada o inactiva" });
        }

        if (originAccount.currency !== targetAccount.currency) {
            return res.status(400).json({ error: "Las cuentas deben usar la misma moneda para el depósito" });
        }

        originAccount.amount -= amount;
        targetAccount.amount += +amount;

        await originAccount.save();
        await targetAccount.save();

        /*Aqui se guarda la transaccion para que pueda haber un registro de los depositos, transferencias 
        o retiros que realicen en las cuentas.
        */
        await Transaction.create({
            fromAccount: originAccount.noAccount,
            toAccount: targetAccount.noAccount,
            amount,
            type: "TRANSFER",
            currency: originAccount.currency,
            user: originAccount.user,
        });

        res.status(201).json({
            success: true,
            message: "Transaccion realizado exitosamente",
            from: originAccount.noAccount,
            to: targetAccount.noAccount,
            amount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al hacer el Transaccion",
            error: error.message,
        });
    }
};

export const getAccountTransactions = async (req, res) => {

    const userId = req.usuario.id;
    const { accountNo } = req.body;

    try {

        const account = await Account.findOne({ noAccount: accountNo, user: userId });

        if (!account) {
            return res.status(404).json({ error: "Cuenta no encontrada o no te pertenece" });
        }

        const transactions = await Transaction.find({
            $or: [
                { fromAccount: accountNo },
                { toAccount: accountNo }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            transactions,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial",
            error: error.message,
        });
    }
};

export const deposit = async (req, res) => {
    const userId = req.usuario.id;
    const { fromAccount, amount } = req.body;

    // Verifico que los datos recibidos en el cuerpo de la solicitud sean válidos
    if (!fromAccount || !amount || amount <= 0) {
        return res.status(400).json({ error: "Datos inválidos para el depósito" });
    }

    try {
        // Se busca la cuenta de origen del usuario para verificar que exista y esté activa
        const originAccount = await Account.findOne({
            noAccount: fromAccount,
            user: userId,
            status: true
        });

        if (!originAccount) {
            return res.status(404).json({ error: "Tu cuenta de origen no fue encontrada o no está activa" });
        }

        originAccount.amount += +amount;

        await originAccount.save();

        /*Aqui se guarda la transaccion para que pueda haber un registro de los depositos, transferencias 
        o retiros que realicen en las cuentas.
        */
        await Transaction.create({
            fromAccount: originAccount.noAccount,
            amount,
            type: "DEPOSIT",
            currency: originAccount.currency,
            user: originAccount.user,
        });

        res.status(201).json({
            success: true,
            message: "Depósito realizado exitosamente",
            from: originAccount.noAccount,
            amount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al hacer el depósito",
            error: error.message,
        });
    }
};

export const removeDeposit = async (req, res) => {
    const userId = req.usuario.id;
    const { fromAccount, amount } = req.body;

    // Verifico que los datos recibidos en el cuerpo de la solicitud sean válidos
    const numericAmount = parseFloat(amount);
    if (!fromAccount || isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: "Debe proporcionar una cuenta válida y un monto mayor a cero" });
    }
    try {
        // Se busca la cuenta de origen del usuario para verificar que exista y esté activa
        const originAccount = await Account.findOne({
            noAccount: fromAccount,
            user: userId,
            status: true
        });

        if (!originAccount) {
            return res.status(404).json({ error: "Tu cuenta de origen no fue encontrada o no está activa" });
        }

        if (originAccount.amount < numericAmount) {
            return res.status(400).json({
                error: `Fondos insuficientes. Saldo disponible: ${originAccount.amount}`,
            });
        }

        originAccount.amount -= amount;
        await originAccount.save();

        /*Aqui se guarda la transaccion para que pueda haber un registro de los depositos, transferencias 
        o retiros que realicen en las cuentas.
        */
        await Transaction.create({
            fromAccount: originAccount.noAccount,
            amount,
            type: "WITHDRAWAL",
            currency: originAccount.currency,
            user: originAccount.user,
        });

        res.status(201).json({
            success: true,
            message: "Se retiro dinero de tu cuenta exitosamente",
            from: originAccount.noAccount,
            amount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al hacer el retiro",
            error: error.message,
        });
    }
};

