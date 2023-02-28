const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host:"smtp.hostinger.com",
  port:465,
  secure:true, // true for only 465 and false for other ports
  auth:{
    user:process.env.AUTH_EMAIL,
    pass:process.env.AUTH_PASS
  }
});

module.exports = transporter;
