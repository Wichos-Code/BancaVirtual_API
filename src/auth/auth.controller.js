import User from "../user/user.model.js"
import { hash } from "argon2"
import { sendVerificationEmail } from "../middlewares/send-email.js"

const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ username: "admin" });


        if (!existingAdmin) {
            const hashedPassword = await hash("admin");

            const admin = new User({
                name: "Admin",
                surname: "Bank",
                username: "admin",
                email: "admin_bankk@gmail.com",
                dpi:2154630128745,
                phone:"23145210",
                password: hashedPassword,
                role: "ADMIN_ROLE", 
                status: true,
            });

   
            await admin.save();
            console.log("Admin creado correcaamente.");
        } else {
            console.log("Ya existe un administrador.");
        }
    } catch (error) {
        console.error("Error al crear usuario", error);
    }
};

export default createAdminUser;