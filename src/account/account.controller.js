import Account from "./account.model.js";
import Transaction from "../transaction/transaction.model.js";
import User from "../user/user.model.js"; 
import axios from "axios";

const generateRandomAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

export const createAccount = async (req, res) => {
    try {
        const { amount, currency, type, targetDPI, targetUsername } = req.body; // Ahora esperamos DPI o username
        const adminUser = req.usuario; // El usuario que está haciendo la solicitud (admin/supervisor)

        // 1. Validar que solo ADMIN_ROLE o SUPERVISOR_ROLE puedan crear cuentas para otros
        if (adminUser.role !== "ADMIN_ROLE" && adminUser.role !== "SUPERVISOR_ROLE") {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado. Solo administradores y supervisores pueden crear cuentas.",
            });
        }

        // 2. Validar que se proporcione DPI o username (pero no ambos, o que al menos uno exista)
        if (!targetDPI && !targetUsername) {
            return res.status(400).json({
                success: false,
                message: "Debe proporcionar el DPI o el nombre de usuario del cliente para crear la cuenta.",
            });
        }
        if (targetDPI && targetUsername) {
            return res.status(400).json({
                success: false,
                message: "Por favor, proporcione solo el DPI o solo el nombre de usuario, no ambos.",
            });
        }

        let targetUser = null;

        // 3. Buscar al usuario por DPI o username
        if (targetDPI) {
            // CORRECCIÓN: Usar 'dpi' en minúsculas
            targetUser = await User.findOne({ dpi: targetDPI.trim() });
        } else if (targetUsername) {
            targetUser = await User.findOne({ username: targetUsername.trim() });
        }

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado. Verifique el DPI o nombre de usuario proporcionado.",
            });
        }

        // 4. Construir los datos de la nueva cuenta
        const accountData = {
            user: targetUser._id, // Asignar la cuenta al usuario encontrado
            amount: amount || 0, // Si no se especifica, iniciar con 0
            currency: currency,
            type: type,
            status: true // Por defecto, la cuenta se crea activa
        };

        // 5. Generar un número de cuenta único
        let newAccountNumber;
        let exist = true;
        while (exist) {
            newAccountNumber = generateRandomAccountNumber();
            const existingAccount = await Account.findOne({ noAccount: newAccountNumber });
            if (!existingAccount) {
                exist = false;
            }
        }
        accountData.noAccount = newAccountNumber;

        // 6. Crear y guardar la nueva cuenta
        const newAccount = new Account(accountData);
        await newAccount.save();

        // 7. (Opcional) Asociar la nueva cuenta al usuario en su modelo de usuario
        // Esto depende de cómo tengas tu modelo de usuario. Si el usuario tiene un array de `accounts`
        // por ejemplo: user.accounts.push(newAccount._id); await user.save();
        // Si no lo tienes, o lo manejas solo desde el lado de Account, puedes omitir este paso.
        // Aquí un ejemplo si el modelo de usuario tuviera un campo `accounts`:
        if (targetUser.accounts) { // Asumiendo que User.model.js tiene un array `accounts`
             targetUser.accounts.push(newAccount._id);
             await targetUser.save();
        }


        res.status(201).json({
            success: true,
            message: `Cuenta creada correctamente para el usuario ${targetUser.username}.`,
            account: newAccount,
            owner: {
                id: targetUser._id,
                name: targetUser.name,
                username: targetUser.username,
                dpi: targetUser.dpi // CORRECCIÓN: Aquí también para la respuesta
            }
        });
    } catch (error) {
        console.error("Error al crear la cuenta:", error); // Log para depuración
        let errorMessage = "Error interno al crear la cuenta.";
        if (error.code === 11000) { // Error de duplicidad de MongoDB
            errorMessage = "Ya existe una cuenta con el número generado (intenta de nuevo) o un problema de unicidad.";
        }
        res.status(500).json({
            success: false,
            message: errorMessage,
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


        const originAccount = await Account.findOne({
            noAccount: noAccount,
            user: userId,
            status: true
        }).populate('user', 'name email uid');

        if (!originAccount) {
            return res.status(404).json({ error: "Tu cuenta de origen no fue encontrada o no está activa" });
        }


        const targetCurrencies = ["USD", "EUR", "GTQ", "MXN", "COP", "ARS", "JPY", "GBP"];
        const originCurrency = originAccount.currency;
        const originalAmount = originAccount.amount;

        const EXCHANGE_API_URL = process.env.EXCHANGE_API_URL;
        const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;


        const conversionPromises = targetCurrencies.map(async (target) => {
            if (target === originCurrency) {
                return { [target]: originalAmount };
            }
            const url = `${EXCHANGE_API_URL}/${EXCHANGE_API_KEY}/pair/${originCurrency}/${target}/${originalAmount}`;
            try {
                const response = await axios.get(url);
                if (response.data?.result === 'success') {
                    return { [target]: response.data.conversion_result };
                } else {
                    return { [target]: null };
                }
            } catch (error) {
                console.error(`Error al convertir a ${target}:`, error.message);
                return { [target]: null };
            }
        });


        const conversionResults = await Promise.all(conversionPromises);


        const convertedAmounts = conversionResults.reduce((acc, curr) => {
            return { ...acc, ...curr };
        }, {});

        res.status(200).json({
            success: true,
            account: {
                ...originAccount.toObject(),
                amount: convertedAmounts,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las cuentas",
            error: error.message,
        });
    }
};


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

    if (!fromAccount || !toAccount || !amount || amount <= 0) {
        return res.status(400).json({ error: "Datos inválidos para el depósito" });
    }

    try {
        if (fromAccount === toAccount) {
            return res.status(400).json({ error: "No puedes transferir dinero a la misma cuenta" });
        }
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

        let convertedAmount = amount;

        if (originAccount.currency !== targetAccount.currency) {
            try {
                convertedAmount = convertCurrency(amount, originAccount.currency, targetAccount.currency);
                originAccount.amount -= amount;
                targetAccount.amount += convertedAmount;
            } catch (err) {
                return res.status(400).json({ error: err.message });
            }
        } else {
            originAccount.amount -= amount;
            targetAccount.amount += amount;
        }

        await originAccount.save();
        await targetAccount.save();

        await Transaction.create({
            fromAccount: originAccount.noAccount,
            toAccount: targetAccount.noAccount,
            amount,
            type: "TRANSFER",
            currency: originAccount.currency,
            user: originAccount.user,
            convertedTo: targetAccount.currency,
            convertedAmount
        });

        res.status(201).json({
            success: true,
            message: "Transaccion realizado exitosamente",
            from: originAccount.noAccount,
            to: targetAccount.noAccount,
            amount,
            convertedAmount
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

    if (!fromAccount || !amount || amount <= 0) {
        return res.status(400).json({ error: "Datos inválidos para el depósito" });
    }

    try {
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

    const numericAmount = parseFloat(amount);
    if (!fromAccount || isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: "Debe proporcionar una cuenta válida y un monto mayor a cero" });
    }
    try {
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

export const convertData = async (req, res) => {
    const path = process.env.EXCHANGE_API_URL
    const key = process.env.EXCHANGE_API_KEY

    try {
        const { from, to, amount } = req.body
        console.log(req.body)
        const url = `${path}/${key}/pair/${from}/${to}/${amount}`

        const response = await axios.get(url)

        if (response.data && response.data.result === 'success') {
            res.status(200).json({
                base: from,
                target: to,
                conversionRate: response.data.conversion_rate,
                conversionAmount: response.data.conversion_result
            })
        } else {
            res.status(400).json({
                msg: 'Error al convertir las divisas',
                details: response.data
            })
        }

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            msg: 'Se produjo un error al realizar la conversión',
            e
        })
    }
}

export const exchangeRates = {
    USD: { GTQ: 7.75, EUR: 0.91, MXN: 18.2, COP: 3900, ARS: 910, JPY: 157.3, GBP: 0.78 },
    GTQ: { USD: 0.13, EUR: 0.12, MXN: 2.35, COP: 502.5, ARS: 120.0, JPY: 20.3, GBP: 0.10 },
    EUR: { USD: 1.1, GTQ: 8.4, MXN: 20.0, COP: 4300, ARS: 980, JPY: 171.5, GBP: 0.86 },
    MXN: { USD: 0.055, EUR: 0.05, GTQ: 0.43, COP: 215, ARS: 49, JPY: 8.6, GBP: 0.043 },
    COP: { USD: 0.00026, EUR: 0.00023, GTQ: 0.00199, MXN: 0.0046, ARS: 0.23, JPY: 0.040, GBP: 0.00020 },
    ARS: { USD: 0.0011, EUR: 0.0010, GTQ: 0.0083, MXN: 0.020, COP: 4.3, JPY: 0.18, GBP: 0.00089 },
    JPY: { USD: 0.0064, EUR: 0.0058, GTQ: 0.049, MXN: 0.12, COP: 25.0, ARS: 5.5, GBP: 0.0050 },
    GBP: { USD: 1.28, EUR: 1.17, GTQ: 10.0, MXN: 23.1, COP: 4800, ARS: 1120, JPY: 199 },
};

export function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    const rate = exchangeRates[fromCurrency]?.[toCurrency];
    if (!rate) throw new Error("No hay tasa de cambio para esta conversión");
    return amount * rate;
}

export const getFavorites = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const accounts = await Account.find({ user: userId, status: true }).populate("favorites");
    const allFavorites = accounts.flatMap(acc => acc.favorites).filter(Boolean);

    res.status(200).json({
      success: true,
      favorites: allFavorites,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las cuentas favoritas",
      error: err.message
    });
  }
};


export const addFavoriteAccount = async (req, res) => {
  try {
    const { id }  = req.usuario;
    const { myAccountNo, favoriteAccountId } = req.body;

    const myAccount = await Account.findOne({
      noAccount: myAccountNo,
      user: id,
      status: true,
    });

    myAccount.favorites = favoriteAccountId;
    await myAccount.save();

    res.status(200).json({
      success: true,
      message: "Cuenta favorita agregada exitosamente",
      favorites: myAccount.favorites,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error al agregar cuenta favorita",
      error: err.message,
    });
  }
};

export const getMostActiveAccounts = async (req, res) => {
    try {
        const user = req.usuario;

        if (user.role !== "ADMIN_ROLE" && user.role !== "SUPERVISOR_ROLE") {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para realizar esta acción.",
            });
        }

        const mostActiveAccounts = await Transaction.aggregate([
            {
                $match: {
                    type: { $in: ["TRANSFER", "DEPOSIT", "WITHDRAWAL"] } // Incluir todos los tipos de movimiento
                }
            },
            {
                $group: {
                    _id: "$fromAccount", // Agrupar por la cuenta de origen
                    totalMovement: { $sum: "$amount" }
                }
            },
            {
                $lookup: {
                    from: "accounts", // Nombre de la colección de cuentas
                    localField: "_id",
                    foreignField: "noAccount",
                    as: "accountInfo"
                }
            },
            {
                $unwind: "$accountInfo" // Desglosar el array accountInfo
            },
            {
                $lookup: {
                    from: "users", // Nombre de la colección de usuarios
                    localField: "accountInfo.user",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo" // Desglosar el array userInfo
            },
            {
                $project: {
                    _id: 0,
                    noAccount: "$_id",
                    ownerName: "$userInfo.name",
                    ownerUsername: "$userInfo.username",
                    totalMovement: 1,
                    currency: "$accountInfo.currency",
                    currentBalance: "$accountInfo.amount"
                }
            },
            {
                $sort: { totalMovement: -1 } // Ordenar de mayor a menor movimiento
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Cuentas con más movimientos obtenidas exitosamente",
            accounts: mostActiveAccounts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener las cuentas con más movimientos",
            error: error.message,
        });
    }
};


export const getAccountDetailsForAdmin = async (req, res) => {
    try {
        const user = req.usuario;
        const { id } = req.params; // ID de la cuenta, no del usuario

        if (user.role !== "ADMIN_ROLE" && user.role !== "SUPERVISOR_ROLE") {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para realizar esta acción.",
            });
        }

        const account = await Account.findById(id).populate("user", "name username email");

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Cuenta no encontrada.",
            });
        }

        // Obtener los últimos 5 movimientos de la cuenta
        const transactions = await Transaction.find({
            $or: [
                { fromAccount: account.noAccount },
                { toAccount: account.noAccount }
            ]
        })
        .sort({ createdAt: -1 }) // Ordenar por fecha de creación descendente (más recientes primero)
        .limit(5); // Limitar a los últimos 5 movimientos

        res.status(200).json({
            success: true,
            message: "Detalles de la cuenta obtenidos exitosamente",
            accountDetails: {
                _id: account._id,
                noAccount: account.noAccount,
                currency: account.currency,
                amount: account.amount, // Saldo actual
                type: account.type,
                status: account.status,
                user: account.user, // Información del propietario de la cuenta
                last5Movements: transactions, // Los últimos 5 movimientos
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener los detalles de la cuenta",
            error: error.message,
        });
    }
};

export const reverseDeposit = async (req, res) => {
    try {
        const adminUser = req.usuario;
        const { transactionId } = req.body; // ID de la transacción de depósito a revertir

        if (adminUser.role !== "ADMIN_ROLE" && adminUser.role !== "SUPERVISOR_ROLE") {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para realizar esta acción.",
            });
        }

        const depositTransaction = await Transaction.findById(transactionId);

        if (!depositTransaction) {
            return res.status(404).json({
                success: false,
                message: "Transacción de depósito no encontrada.",
            });
        }

        if (depositTransaction.type !== "DEPOSIT") {
            return res.status(400).json({
                success: false,
                message: "Solo se pueden revertir transacciones de tipo 'DEPOSIT'.",
            });
        }

        // Verificar si ya ha pasado más de 1 minuto
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000); // 60 segundos * 1000 ms
        if (depositTransaction.createdAt < oneMinuteAgo) {
            return res.status(400).json({
                success: false,
                message: "No se puede revertir el depósito, ha pasado más de 1 minuto.",
            });
        }

        // Verificar si el depósito ya fue revertido para evitar dobles reversiones
        const existingReversal = await Transaction.findOne({
            originalTransaction: transactionId,
            type: "DEPOSIT_REVERSAL"
        });

        if (existingReversal) {
            return res.status(400).json({
                success: false,
                message: "Este depósito ya ha sido revertido previamente.",
            });
        }

        // Revertir el monto del depósito de la cuenta
        const targetAccount = await Account.findOne({ noAccount: depositTransaction.fromAccount }); // La cuenta donde se hizo el depósito

        if (!targetAccount) {
            return res.status(404).json({
                success: false,
                message: "Cuenta asociada al depósito no encontrada.",
            });
        }

        if (targetAccount.amount < depositTransaction.amount) {
            return res.status(400).json({
                success: false,
                message: "Fondos insuficientes en la cuenta para revertir el depósito.",
            });
        }

        targetAccount.amount -= depositTransaction.amount;
        await targetAccount.save();

        // Registrar la transacción de reversión
        const reversalTransaction = await Transaction.create({
            fromAccount: depositTransaction.fromAccount,
            amount: depositTransaction.amount,
            type: "DEPOSIT_REVERSAL", // Nuevo tipo de transacción para reversiones
            currency: depositTransaction.currency,
            user: depositTransaction.user,
            originalTransaction: depositTransaction._id, // Referencia a la transacción original
            notes: "Depósito revertido por administrador"
        });

        // Opcional: Marcar la transacción original como revertida (si tu esquema Transaction tuviera un campo `isReversed`)
        // depositTransaction.isReversed = true;
        // await depositTransaction.save();

        res.status(200).json({
            success: true,
            message: "Depósito revertido exitosamente.",
            reversalDetails: reversalTransaction,
            updatedAccountBalance: targetAccount.amount,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al revertir el depósito.",
            error: error.message,
        });
    }
};
