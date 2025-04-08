const express = require("express");
const {
    register,
    login,
    enableMFA,
    verifyMFA,
    verifySetupMFA,
    disableMFA,
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

//Rutas protegidas para MFA
router.post("/verify-mfa", verifyMFA);
router.get("/enable-mfa", protect, enableMFA);
router.post("/verify-setup-mfa", protect, verifySetupMFA);
router.post("/disable-mfa", protect, disableMFA);

module.exports = router;
