const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendPasswordResetEmail = async (email, token) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Recuperación de contraseña",
        text: `Usa este token para restablecer tu contraseña: ${token}`
    };

    await transporter.sendMail(mailOptions);
};
