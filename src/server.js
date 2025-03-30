require("dotenv").config({ path: "../.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const http = require("http");
const WebSocket = require("ws");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = http.createServer(app); // Crear servidor HTTP

// Configurar CORS correctamente
const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true, // Permitir cookies y headers de autenticación
};
app.use(cors(corsOptions));

// Crear servidor WebSocket
const wss = new WebSocket.Server({ server });

// Manejo de conexiones WebSocket
wss.on("connection", (ws) => {
    console.log("🟢 Cliente conectado");

    ws.on("message", (message) => {
        try {
            const parsedMessage = JSON.parse(message); // Si es JSON, analizarlo
            console.log(`📩 Mensaje recibido: ${parsedMessage}`);

            // Reenviar el mensaje a todos los clientes conectados
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (error) {
            console.warn("⚠️ Mensaje inválido recibido");
        }
    });

    ws.on("close", () => {
        console.log("🔴 Cliente desconectado");
    });
});

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));

// Rutas
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor solo si la BD está conectada
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
    } catch (error) {
        console.error("❌ Error al conectar la base de datos:", error);
        process.exit(1);
    }
};

startServer();
