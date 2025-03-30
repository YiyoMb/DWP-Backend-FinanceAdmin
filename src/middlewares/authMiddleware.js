const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Importa el modelo de usuario

const protect = async (req, res, next) => {
    let token;

    // Verificar si el token viene en el header Authorization con formato Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Obtener el token después de "Bearer"
            token = req.headers.authorization.split(" ")[1];

            // Verificar el token con la clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Buscar el usuario en la base de datos sin incluir la contraseña
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ message: "Usuario no encontrado" });
            }

            next(); // Pasar al siguiente middleware o controlador
        } catch (error) {
            console.error("Error en la verificación del token:", error);
            return res.status(401).json({ message: "Token inválido o expirado" });
        }
    }

    // Si no hay token, responder con error
    if (!token) {
        return res.status(401).json({ message: "Acceso denegado, token requerido" });
    }
};

module.exports = { protect };
