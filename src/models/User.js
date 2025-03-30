const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model("User", UserSchema);