const express = require("express");
const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../email");
const crypto = require("crypto");


const emailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account verification OTP",
    html: `<p>Your OTP for verifying you account is <b>${otp}</b> , Valid only for 4 minutes</p>`,
  });
};

router.post("/register", async (req, res) => {
  const { name, email, phone, password, role, adminSecret } = req.body;
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res
        .status(400)
        .json({ message: "User alreday exist with this Email" });
    }
    if (role === "admin") {
      if (!adminSecret || adminSecret !== process.env.SECRET_KEY_ADMIN) {
        return res
          .status(403)
          .json({ message: "Admin Secret key is require or invalid" });
      }
    }

    const hashPassword = await bcrypt.hash(password, 8);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashPassword,
      role,
    });
    await newUser.save();

    const otp = crypto.randomInt(100000, 999999).toString();
    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    await emailOtp(email, otp);

    res.status(201).json({
      message: "Register successfully. Please verify you Email ID",
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

router.post("/login", async (req, res) => {
  const { phone, password} = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const matching = await bcrypt.compare(password, user.password);
    if (!matching) {
      return res.status(400).json({ message: "Invaild credential" });
    }
    if (!user.isVerified) {
      return res.status(401).json({ message: "Email ID not verified" });
    }

    secret =
      user.role === "admin"
        ? process.env.SECRET_KEY_ADMIN
        : process.env.SECRET_KEY_USER;

    const token = jwt.sign({ id: user._id, role: user.role }, secret, {
      expiresIn: "1h",
    });
    res
      .status(201)
      .json({ message: "Login Successfully", token, role: user.role, user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user", error });
  }
});

router.post("/verifyOtp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const otpcheck = await Otp.findOne({ email, otp });
    if (!otpcheck) {
      return res.status(404).json({ message: "Invalid or expire OTP" });
    }
    await User.updateOne({ phoemailne }, { isVerified: true });
    await Otp.deleteOne({ email, otp });
    res.status(202).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(501).json({ message: "Error in verifying the OTP", error });
  }
});

router.post("/resendOtp", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await Otp.deleteMany({ email });

    const otp = crypto.randomInt(100000, 999999).toString();
    const resendOtp = new Otp({ email, otp });
    await resendOtp.save();

    await emailOtp(email, otp);

    res.status(202).json({ message: "OTP Resended successfully" });
  } catch (error) {
    res.status(501).json({ message: "Error in resending the OTP", error });
  }
});

router.post("/resetPassword", async (req, res) => {
  const { email, otp, password } = req.body;
  try {
    const otpcheck = await Otp.findOne({ email, otp });
    if (!otpcheck) {
      return res.status(404).json({ message: "Invalid number or expire OTP" });
    }
    const hashPassword = await bcrypt.hash(password, 8);
    await User.updateOne({ email }, { password: hashPassword });
    await Otp.deleteOne({ email, otp });
    res.status(202).json({ message: "Password Reseted successfully" });
  } catch (error) {
    res.status(501).json({ message: "Error in resetting the password", error });
  }
});

router.get("/userCount",async(req,res)=>{
  try {
    const usercount = await User.countDocuments()  
    res.status(200).json({
      message: "User count fetched successfully",
      count: usercount
    });
  } catch (error) {
    res.status(501).json({
      message: "Error fetching User count",
      error: error.message
    });
  }
})

module.exports = router;
