import Account from "./account.model";

const generateRandomAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

export const createAccount = async () => {
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