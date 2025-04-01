const jwt = require("jsonwebtoken");
const User = require("../models/User"); //Modelo de BD

const protect = async (req, res, next) => {
    let token;

    try {
        // Verificar si el token viene en el header Authorization con formato Bearer
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // Obtener el token después de "Bearer"
            token = req.headers.authorization.split(" ")[1];

            if (!token) {
                return res.status(401).json({ message: "No se proporcionó un token válido" });
            }

            try {
                // Verificar el token con la clave secreta
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Buscar el usuario en la base de datos sin incluir la contraseña
                const user = await User.findById(decoded.userId).select("-password");
                console.log("ID decodificado del token:", decoded.id);

                if (!user) {
                    return res.status(401).json({ message: "Usuario no encontrado" });
                }

                // Asignar el usuario a req.user
                req.user = user;
                next(); // Pasar al siguiente middleware o controlador
            } catch (error) {
                console.error("Error en la verificación del token:", error);
                return res.status(401).json({ message: "Token inválido o expirado", error: error.message });
            }
        } else {
            return res.status(401).json({ message: "Acceso denegado, token requerido" });
        }
    } catch (error) {
        console.error("Error general en middleware de autenticación:", error);
        return res.status(500).json({ message: "Error del servidor al procesar la autenticación" });
    }
};

module.exports = { protect };