const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ fullName, email, password: hashedPassword });

        await user.save();
        res.status(201).json({ message: "Usuario registrado" });
    } catch (error) {
        // Manejo de error de duplicado
        if (error.code === 11000) {
            return res.status(400).json({ message: "El correo ya está en uso. Intente con otro." });
        }
        res.status(500).json({ error: "Error en el registro" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        if (user.mfaEnabled) {
            // No enviamos el token aún, pedimos código MFA
            return res.json({ mfaRequired: true });
        }

        // Si no tiene MFA, le enviamos el token de acceso directamente
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

exports.enableMFA = async (req, res) => {
    const userId = req.user.id; // ID del usuario autenticado

    try {
        // Generar clave secreta única
        const secret = speakeasy.generateSecret({ name: "MiApp" });

        // Guardar la clave en la base de datos
        await User.findByIdAndUpdate(userId, { mfaSecret: secret.base32 });

        // Generar QR Code para Google Authenticator
        const qrDataURL = await qrcode.toDataURL(secret.otpauth_url);

        return res.json({ qrCode: qrDataURL });
    } catch (error) {
        console.error("❌ Error al habilitar MFA:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

exports.verifyMFA = async (req, res) => {
    const { email, token } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: "base32",
            token,
        });

        if (!verified) {
            return res.status(401).json({ message: "Código MFA incorrecto" });
        }

        // Ahora sí, enviamos el token de sesión
        const authToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token: authToken });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "El correo no está registrado." });

        // Generar token único
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Actualizar usuario con el token y fecha de expiración
        // Esto funciona incluso si los campos aún no existen en este documento
        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: Date.now() + 3600000 // Expira en 1 hora
        });

        // Enviar email con el token
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Restablecer Contraseña",
            html: `<p>Haga clic en el enlace para restablecer su contraseña:</p>
                   <a href="${resetUrl}">Restablecer Contraseña</a>`
        });

        res.json({ message: "Revisa tu correo para restablecer tu contraseña." });
    } catch (error) {
        res.status(500).json({ message: "Error al enviar el correo." });
    }
};

exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: "Token inválido o expirado." });

        // Cifrar nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar usuario
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetPasswordToken: undefined,
            resetPasswordExpires: undefined
        });

        res.json({ message: "Contraseña restablecida. Ahora puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer la contraseña." });
    }
};
