import { Schema, model } from "mongoose";

const transactionSchema = new Schema({
    fromAccount: {
        type: Number,
        required: true,
    },
    toAccount: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["DEPOSIT", "WITHDRAWAL", "TRANSFER"],
        required: true,
    },
    currency: {
        type: String,
        required: true,
        enum: ["USD", "EUR", "GTQ", "MXN", "COP", "ARS", "JPY", "GBP"],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, {
    versionKey: false,
    timestamps: true,
});

export default model("Transaction", transactionSchema);
