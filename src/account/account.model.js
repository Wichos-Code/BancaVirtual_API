import { Schema, model } from "mongoose";

const accountSchema = new Schema({
  noAccount: {
    type: Number,
    maxLength: [25, "Account number cannot exceed 25 characters"],
  },
  currency: {
    type: String,
    required: true,
    enum: ["USD", "EUR", "GTQ", "MXN", "COP", "ARS", "JPY", "GBP"],
  },
  amount: {
    type: Number,
    default: 0,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Monetary", "Savings"],
  },
  status: {
    type: Boolean,
    default: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  favorites:{
    type:Schema.Types.ObjectId,
    ref: "Account",
    required: false
    
  },
}, {
  versionKey: false,
  timestamps: true
});

export default model("Account", accountSchema);
