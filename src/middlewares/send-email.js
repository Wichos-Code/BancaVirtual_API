import nodemailer from "nodemailer"
import path, { dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url));

export const sendVerificationEmail = async (email, code) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verifica tu cuenta",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Verificación de cuenta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #141a2b;
            margin: 0;
            padding: 0;
          }
          .container {
            background-color: #242d3c;
            max-width: 600px;
            margin: 30px auto;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          }
          .header {
            background-color: #141a2b;
            color: #edb52c;
            text-align: center;
            padding: 20px;
          }
          .header img {
            max-width: 80px;
            margin-bottom: 10px;
          }
          .content {
            padding: 20px;
            color: #ffffff;
          }
          .content p {
            color: #d1d9e6;
          }
          .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 20px;
            background-color: #edb52c;
            color: #141a2b;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
          }
          .footer {
            background-color: #141a2b;
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #566681;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:byteforce logo" alt="ByteForce Logo" />
            <h2>Verificación de Cuenta</h2>
          </div>
          <div class="content">
            <p>Gracias por registrarte. Haz clic en el siguiente enlace para verificar tu cuenta:</p>
            <a href="http://localhost:3000/api/verify/${code}" class="button">Verificar cuenta</a>
            <p style="margin-top: 20px;">Si no fuiste tú quien se registró, puedes ignorar este mensaje.</p>
          </div>
          <div class="footer">
            © 2025 Byte Force. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: 'LogoBF.png',
        path: path.join(__dirname, '../../public/uploads/email/LogoBF.png'),
        cid: 'wichoslogo',
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};