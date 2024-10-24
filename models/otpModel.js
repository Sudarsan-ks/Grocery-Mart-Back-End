const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "4m" },
});

const Otp = mongoose.model("otp", otpSchema);
module.exports = Otp;
