import User from "../user/user.model.js"
import { hash, verify } from "argon2"
import { sendVerificationEmail } from "../middlewares/send-email.js"
import { generateJWT } from "../helpers/generate-jwt.js";

const createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ username: "admin" });


        if (!existingAdmin) {
            const hashedPassword = await hash("ADMINB");

            const admin = new User({
                name: "Admin",
                surname: "Bank",
                username: "ADMINB",
                email: "admin_bankk@gmail.com",
                dpi:2154630128745,
                direction: "6 avenida 13-54 zona 7, Colonia Landívar",
                income:100,
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


export const register = async (req,res) => {
    try {
        const data = req.body
        const encryptedPassword = await hash(data.password)

        data.password = encryptedPassword
        data.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        data.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000

        const user = await User.create(data)
        
        await sendVerificationEmail(data.email, data.verificationToken)

        return res.status(201).json({
            message: "Usuario registrado, por favor revisa tu correo para verificar tu cuenta",
            userDetails: {
                user: user.username,
                email: user.email
            }
        })
        

    } catch (err) {
        console.log(err.message)
        return res.status(500).json({
            message: "Error al registrar al usuario",
            error: err.message
        })
    }
}

export const verifyEmail = async (req, res) => {
    try {
      const { code } = req.params;
  
      const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ message: "Token inválido o expirado." });
      }
  
      user.status = true
      user.verificationToken = undefined
      user.verificationTokenExpiresAt = undefined
  
      await user.save();
  
      res.status(200).json({ message: "✅ Cuenta verificada con éxito." });
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor." });
    }
}

export const login = async (req, res) => {
    const { dpi, username, password } = req.body
    try{
        const user = await User.findOne({
            $or:[{username: username}, {dpi: dpi}]
        })

        if(!user){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error:"No existe el usuario o correo ingresado"
            })
        }

        const validPassword = await verify(user.password, password)

        if(!validPassword){
            return res.status(400).json({
                message: "Crendenciales inválidas",
                error: "Contraseña incorrecta"
            })
        }

        const token = await generateJWT(user.id)

        return res.status(200).json({
            message: "Login successful",
            userDetails: {
                token: token,
                name: user.name,
                surname: user.surname
            }
        })
    }catch(err){
        return res.status(500).json({
            message: "Error al iniciar sesión, error del servidor",
            error: err.message
        })
    }
}