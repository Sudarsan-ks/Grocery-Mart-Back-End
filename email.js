const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, ready) => {
  if (error) {
    console.log("Error server is not working", error);
  } else {
    console.log("Email server started successfully", ready);
  }
});

module.exports = transporter;
