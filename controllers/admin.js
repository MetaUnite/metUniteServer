const adminModel = require("../model/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userModel = require("../model/userModel");
const otpGenerator = require("otp-generator");
const generator = require("generate-password");
const transporter = require("../utils/sendMailDefaultMethod");
//const emailValidator = require("validator");

exports.admin_signup = async (req, res) => {
  try {
    let { firstName, lastName, mobile_number, password } = req.body;
    let email = req.body.email;
    const checkAdminCount = await adminModel.find();
    if (checkAdminCount.length >= 2) {
      return res.status(400).send({
        message:
          "Admin limit exceeded! Please contact your developer to increase the limit.",
      });
    }
    if (!email) {
      return res.status(400).send({ status: false, msg: " Email is required" });
    }
    const dataExist = await adminModel.findOne({ email: email });
    if (dataExist) {
      return res.status(400).send({ message: "email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const userData = {
      firstName,
      lastName,
      email,
      mobile_number,
      password,
    };
    const dataCreated = await adminModel.create(userData);
    return res
      .status(201)
      .send({ message: "Admin created successfully", data: dataCreated });
  } catch (err) {
    return res.status(500).send(err.message);
    console.log(err);
  }
};

exports.send_otp_toEmail = async (req, res) => {
  try {
    const userMail = req.body.email;
    const userData = await adminModel.findOne({ email: userMail });
    if (!userData) {
      return res
        .status(400)
        .send({ setting: { success: "0", message: "not valid user" } });
    }
    let mail_otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: userMail,
      subject: "OTP",
      text: `Your OTP is ${mail_otp} to login into your account`,
    });

//     const salt = await bcrypt.genSalt(10);
//     mail_otp = await bcrypt.hash(mail_otp, salt);

    await adminModel.updateOne(
      { email: userMail },
      { $set: { otp: mail_otp,otpTime: new Date() } }
    );

    return res
      .status(200)
      .send({ setting: { success: "1", message: "otp sent successfully" } });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const adminEmail = req.body.email;
    const adminPassword = req.body.password;
    const adminData = await adminModel.findOne({ email: adminEmail });
    if (adminData) {
      const { _id, firstName, lastName, password } = adminData;
      const validPassword = await bcrypt.compare(adminPassword, password);
      if (!validPassword) {
        return res.status(400).send({ message: "Invalid Password" });
      }
      let payload = { userId: _id, email: adminEmail };
      const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1440m",
      });
      res.header("jwt-token", generatedToken);
      return res.status(200).send({
        message: `${firstName} ${lastName} You are logged in`,
        token: generatedToken,
      });
    } else {
      return res.status(400).send({ message: "Invalid credentials" });
    }
  } catch (err) {
    return res.status(500).send(err.message);
    console.log(err);
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).send("admin Logout");
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const customerData = await adminModel.findOne({ email: email });
    if (!customerData) {
      return res.status(400).send({ message: "email is not valid" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Forgot Password",
      html: `<h1>OTP for forgot password is ${otp}</h1>
                <p>OTP is valid for 5 minutes</p>
            `,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info);
      }
    });
    await adminModel.findOneAndUpdate(
      { email: email },
      { otp: otp, otpTime: Date.now() }
    );
    return res.status(200).send({ message: "OTP sent to your email", email });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const customerData = await adminModel.findOne({ email: email });
    if (!customerData) {
      return res.status(400).send({ message: "email is not valid" });
    }
    if (!otp) {
      return res.status(400).send({ message: "otp is required" });
    }
    if (customerData.otp == otp) {
      if (Date.now() - customerData.otpTime > 300000) {
        return res.status(400).send({ message: "OTP expired" });
      }
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(password, salt);
      await adminModel.findOneAndUpdate(
        { email: email },
        { password: newPassword }
      );
      return res.status(200).send({ message: "Password updated successfully" });
    } else {
      return res.status(400).send({ message: "OTP is not correct" });
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.admin_update = async (req, res) => {
  try {
    const adminId = req.user.userId;
    let {
      firstName,
      lastName,
      email,
      mobile_number,
      oldPassword,
      isDeleted,
      newPassword,
    } = req.body;
    const userAdmin = await adminModel.findOne({ _id: adminId });
    let password;
    if (oldPassword) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(newPassword, salt);
    }
    console.log(password);
    if (userAdmin.isDeleted == true) {
      return res
        .status(400)
        .send({ message: "admin is not registered, register first" });
    }
    const newAdminData = await adminModel.findOneAndUpdate(
      { _id: adminId, isDeleted: false },
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        mobile_number: mobile_number,
        isDeleted: isDeleted,
      },
      { new: true }
    );
    return res.status(200).send({
      message: "Admin data updated successfully",
      UpdatedData: newAdminData,
    });
  } catch (err) {
    return res.status(500).send(err.message);
    console.log(err);
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const adminId = req.user.userId;
    const adminData = await adminModel.findOne({ _id: adminId });
    return res.status(200).send({
      setting: { success: "1", message: "admin data", data: adminData },
    });
  } catch (err) {
    return res.status(500).send(err.message);
    console.log(err);
  }
};
// exports.blockUser = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const userId = req.user.userId;
//     const adminData = await adminModel.findOne({ _id: userId });
//     if (adminData.isDeleted == true || !adminData) {
//       return res
//         .status(400)
//         .send({ message: "admin is not registered, register first" });
//     }

//     const checkUser = await userModel.findOne({
//       email: email,
//       isDeleted: false,
//     });
//     if (!checkUser) {
//       return res
//         .status(400)
//         .send({ message: "There is no such user exist in our records" });
//     }

//     checkUser.isBlocked = true;
//     await checkUser.save();
//     return res.status(200).send({ message: "User blocked successfully" });
//   } catch (error) {
//     return res.status(500).send(err.message);
//     console.log(err);
//   }
// };

// exports.unBlockUser = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const userId = req.user.userId;
//     const adminData = await adminModel.findOne({ _id: userId });
//     if (adminData.isDeleted == true || !adminData) {
//       return res.status(400).send({
//         message: "admin is not registered, register first",
//       });
//     }

//     const checkUser = await userModel.findOne({
//       email: email,
//       isDeleted: false,
//     });
//     if (!checkUser) {
//       return res.status(400).send({
//         message: "There is no such user exist in our records",
//       });
//     }
//     if (checkUser.isBlocked == false) {
//       return res.status(400).send({
//         message: "User is not blocked",
//       });
//     }
//     checkUser.isBlocked = false;
//     await checkUser.save();
//     return res.status(200).send({ message: "User unblocked successfully" });
//   } catch (error) {
//     return res.status(500).send(err.message);
//     console.log(err);
//   }
// };
