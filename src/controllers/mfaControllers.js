const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");

exports.generateMfaSecret = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        // Generar secreto MFA
        const secret = speakeasy.generateSecret({
            name: `FinanceAdmin (${user.email})`
        });

        // Guardar secreto en la base de datos (sin activarlo todavía)
        user.mfaSecret = secret.base32;
        await user.save();

        // Generar QR Code para Google Authenticator
        QRCode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) return res.status(500).json({ error: "Error generando código QR" });
            res.json({ qrCode: data_url, secret: secret.base32 });
        });

    } catch (error) {
        res.status(500).json({ error: "Error generando secreto MFA" });
    }
};

exports.verifyMfaToken = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.mfaSecret) return res.status(400).json({ error: "MFA no configurado" });

        // Validar token con el secreto guardado
        const isValid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: "base32",
            token
        });

        if (!isValid) return res.status(401).json({ error: "Código MFA incorrecto" });

        // Activar MFA
        user.mfaEnabled = true;
        await user.save();

        res.json({ message: "MFA activado exitosamente" });

    } catch (error) {
        res.status(500).json({ error: "Error verificando MFA" });
    }
};

