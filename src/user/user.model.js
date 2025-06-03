import { Schema, model } from "mongoose";

const userSchema = Schema({
    name:{
        type: String,
        required: [true, "Name is required"],
        maxLength:[25, "Name cannot exceed 25 characters"]
    },
    surname:{
        type: String,
        required: [true, "Name is required"],
        maxLength:[25, "Name cannot exceed 25 characters"]
    },
    username:{
        type: String,
        required:true,
        unique: true
    },
    password:{
        type: String,
        required: true,
        minLength: 8
    },
    dpi:{
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    direction:{
        type: String,
        required: true
    },
    income:{
        type: Number,
        required: true,
        min: 100
    },
    phone:{
        type: String,
        required: false,
        minLength: 8,
        maxLength: 8
    },
    role:{
        type: String,
        required: true,
        default: "CLIENT_ROLE",
        enum: ["ADMIN_ROLE", "CLIENT_ROLE","SUPERVISOR_ROLE"]
    },
    status:{
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date
},
{
    versionKey: false,
    timeStamps: true
})

userSchema.methods.toJSON = function(){
    const { password, _id, verificationToken, verificationTokenExpiresAt, ...user } = this.toObject()
    user.uid = _id
    return user
}

export default model("User", userSchema)