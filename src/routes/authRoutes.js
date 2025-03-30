const express = require("express");
const {
    register,
    login,
    enableMFA,
    verifyMFA,
    forgotPassword,
    resetPassword
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

//Rutas públicas
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

//Rutas protegidas
router.post("/enable-mfa", protect, enableMFA);
router.post("/verify-mfa", protect, verifyMFA);

module.exports = router;
