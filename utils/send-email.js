import nodemailer from "nodemailer"
import dotenv from "dotenv"
import { getAccessToken } from "./gmailOAuth.js"
 
dotenv.config()

export async function sendVerificationEmail (email, code)  {
  const accessToken = await getAccessToken();
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken
      }
  });

 const mailOptions = {
  from: process.env.EMAIL_FROM,
  to: email,
  subject: "Verificación de cuenta bancaria",
  html: `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Verificación de Cuenta</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 0;
        }
        .container {
          background-color: #ffffff;
          max-width: 600px;
          margin: 30px auto;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .header {
          background-color: #1e3169;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .content {
          padding: 30px 20px;
          color: #333333;
        }
        .code {
          font-size: 24px;
          font-weight: bold;
          color: #1e3169;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          background-color: #f0f0f0;
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #888888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Verificación de Cuenta</h2>
        </div>
        <div class="content">
          <p>Gracias por registrarte con nosotros. Para continuar, por favor ingresa el siguiente código de verificación:</p>
          <div class="code">${code}</div>
          <p>Este código es válido por un tiempo limitado.</p>
          <p>Si tú no realizaste este registro, puedes ignorar este mensaje con seguridad.</p>
        </div>
        <div class="footer">
          © 2025 ByteForce. Todos los derechos reservados.
        </div>
      </div>
    </body>
    </html>
  `,
};

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Correo enviado correctamente:', info.response);
    return email;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }

};
