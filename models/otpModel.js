const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 500 });

const Otp = mongoose.model("Otp", otpSchema);
module.exports = Otp;
