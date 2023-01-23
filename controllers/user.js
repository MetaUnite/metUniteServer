const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const generator = require("generate-password");
const transporter = require("../utils/sendmail");
const feedBackModel = require("../model/feedBackModel");

exports.user_create = async (req, res) => {
  try {
    let {
      first_name,
      last_name,
      user_type,
      email,
      password,
      mobile_number,
      user_profile,
      device_model,
      device_os,
      device_token,
      avatar_id,
      avatar_index,
      readyplayermeId,
    } = req.body;
    if (email) {
      const emailExists = await userModel.findOne({ email: email });

      if (emailExists)
        return res.status(400).send({
          settings: {
            success: "0",
            message: "Email already in use, use different email!",
          },
        });
    }
    if (!user_type) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);

      const otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });

      const uid = Math.floor(10000 + Math.random() * 900000);

      const loginDate = new Date().toISOString().split("T")[0];
      const loginTime = new Date()
        .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
        .slice(11);

      const userData = {
        first_name,
        last_name,
        user_type,
        email,
        password,
        mobile_number,
        user_profile,
        device_model,
        device_os,
        device_token,
        otp,
        avatar_id,
        avatar_index,
        readyplayermeId,
        uid,
        loginDate,
        loginTime,
      };

      const data = await userModel.create(userData);

      let payload = { userId: data._id, email: email, user_type: user_type };

      const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "20080m",
      });

      let info = await transporter.sendMail({
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verification mail by Balaji Yadav for testing api",
        text: `Your One Time Password is ${otp} for email verification`,
      });

      if (info) {
        return res.status(200).send({
          settings: {
            success: "1",
            message: "You have successfully registered.",
          },
          message:
            "we have send an otp to your email please use that otp to verify",
          data: data,
          token: generatedToken,
        });
      }
    } else {
      const uid = Math.floor(10000 + Math.random() * 900000);

      const loginDate = new Date().toISOString().split("T")[0];
      const loginTime = new Date()
        .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
        .slice(11);

      const userData = {
        first_name,
        last_name,
        user_type,
        email,
        password,
        mobile_number,
        user_profile,
        device_model,
        device_os,
        device_token,
        avatar_id,
        avatar_index,
        readyplayermeId,
        uid,
        loginDate,
        loginTime,
      };

      const data = await userModel.create(userData);

      let payload = { userId: data._id, user_type: user_type };

      const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "20080m",
      });

      return res.status(201).send({
        settings: {
          success: "1",
          message: "You have successfully registered.",
        },
        data: data,
        token: generatedToken,
      });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.email_verifier = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otp } = req.body;
    const userCount = await userModel.countDocuments({
      _id: userId,
      otp: otp,
    });

    if (!userCount)
      return res.status(400).send({
        settings: {
          success: "0",
          message: "invalid OTP ",
        },
      });
    await userModel.findOneAndUpdate({ _id: userId }, { emailVerified: true });
    return res.status(201).send({
      settings: {
        success: "1",
        message: "Congratulations! Your email address has been verified",
      },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.get_all_users = async (req, res) => {
  try {
    const users = await userModel.find({});
    return res.status(200).send({
      settings: { success: "1", message: "users fetched successfully" },
      data: users,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.get_user = async (req, res) => {
  try {
    
    let userId = req.user.userId;
    let date = new Date().toISOString().split("T")[0];

    const time = new Date()
      .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
      .slice(11);
    let userData = await userModel.findOneAndUpdate(
      {
        _id: userId,
        userBlock: false,
      },
      { loginDate: date, loginTime: time, userLogout: false },
      { new: true }
    );

    if (!userData) {
      return res.status(404).send({
        settings: {
          success: "0",
          message: "not a valid user or email is not verified",
        },
      });
    }

    if (userData.isDeleted) {
      return res.status(404).send({
        settings: {
          success: "3",
          message: "user does not exist",
        },
      });
    }

    if (userData.userLogout) {
      return res.status(404).send({
        settings: {
          success: "2",
          message: "user is not logged in",
        },
      });
    }

    return res.status(200).send({
      settings: { success: "1", message: "user fetch successfully" },
      data: userData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.user_login = async (req, res) => {
  try {
    const requestEmail = req.body.email;
    const requestPassword = req.body.password;

    let user = await userModel.findOne({
      email: requestEmail,
      userBlock: false,
    });
    if (user) {
      const {
        _id,
        first_name,
        last_name,
        password,
        email,
        isDeleted,
        emailVerified,
        userLogout,
      } = user;

      const isPasswordValid = bcrypt.compareSync(requestPassword, password);
      if (!isPasswordValid)
        return res.status(200).send({
          settings: {
            success: "4",
            message: "Password is not valid, use different password",
          },
        });
      let payload = { userId: _id, email: email };
      const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10080m",
      });

      if (isDeleted == true)
        return res.status(400).send({
          settings: { success: "0", message: "user does not exist!" },
        });

      if (emailVerified == false)
        return res.status(400).send({
          settings: {
            success: "3",
            message: "email is not verified ",
            token: generatedToken,
          },
        });

      const validPassword = await bcrypt.compare(requestPassword, password);
      if (!validPassword)
        return res
          .status(400)
          .send({ settings: { success: "0", message: "Invalid Password" } });
      if (userLogout == true) {
        await userModel.updateOne({ _id: _id }, { userLogout: false });
      }

      res.header("user-login-key", generatedToken);
      return res.status(200).send({
        settings: {
          success: "1",
          message: `${first_name} ${last_name} you have logged in successfully`,
          token: generatedToken,
        },
      });
    } else {
      return res.status(400).send({
        settings: {
          success: "0",
          message: "Please provide valid email or password",
        },
      });
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.forgot_password = async (req, res) => {
  try {
    const requestEmail = req.body.email;
    const userData = await userModel.findOne({
      email: requestEmail,
      emailVerified: true,
    });
    if (!userData)
      return res.status(404).send({
        settings: {
          success: "0",
          message:
            "invalid email id, please provide valid email or you are node a user",
        },
      });

    const { _id, email, userLogout, isDeleted } = userData;
    if (isDeleted == true)
      return res
        .status(400)
        .send({ settings: { success: "0", message: "user does not exist" } });
//     if (userLogout === true)
//       return res.status(400).send({
//         settings: { success: "0", message: "You are not logged in " },
//       });

    let passwords = generator.generateMultiple(1, {
      length: 10,
      uppercase: false,
    });
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(passwords.toString(), salt); //[0]
    await userModel.findOneAndUpdate({ _id: _id }, { password: password });
    // let transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.AUTH_EMAIL,
    //     pass: process.env.AUTH_PASS,
    //   },
    // });
    let info = await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verification mail by Balaji Yadav for testing api",
      text: `Use this token to change password in your application
      
              token '${passwords}'`,
    });
    
    let payload = { userId: _id, email: email };
    
    const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "10080m",
    });
    
    if (info) {
      return res.status(200).send({
        settings: {
          success: "1",
          message: `we have send you a password on your registered email, use that password to change the password,`
        },
        data:{jwtToken:generatedToken},
      });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.new_password = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({
      _id: userId,
      emailVerified: true,
      isDeleted: false,
    });
    const { password } = userData;

    const { sendPassword, newPassword } = req.body;
    const validPassword = await bcrypt.compare(sendPassword, password);
    if (!validPassword)
      return res
        .status(400)
        .send({ settings: { success: "0", message: "Invalid Password" } });
    const salt = await bcrypt.genSalt(10);

    let passwords = await bcrypt.hash(newPassword, salt);

    const newUserData = await userModel.findOneAndUpdate(
      { _id: userId },
      { password: passwords },
      { new: true }
    );

    return res.status(201).send({
      settings: { success: "1", message: "Password changed successfully" },
      data: newUserData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.change_password = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({
      _id: userId,
      emailVerified: true,
    });
    if (!userData.user_type) {
      let { userLogout, isDeleted, password } = userData;
      if (isDeleted == true)
        return res
          .status(400)
          .send({ settings: { success: "0", message: "User does not exist" } });
      if (userLogout === true)
        return res.status(400).send({
          settings: { success: "0", message: "You are not logged in " },
        });

      const { oldPassword, newPassword } = req.body;
      const validPassword = await bcrypt.compare(oldPassword, password);
      if (!validPassword)
        return res
          .status(400)
          .send({ settings: { success: "0", message: "Invalid Password" } });

      const salt = await bcrypt.genSalt(10);

      password = await bcrypt.hash(newPassword, salt);

      const newUserData = await userModel.findOneAndUpdate(
        { email: userId.email },
        { password: password },
        { new: true }
      );

      return res.status(201).send({
        settings: { success: "1", message: "password changed successfully" },
        data: newUserData,
      });
    } else {
      res.status(400).send({ message: "Your are not a verified user" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.edit_profile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userData = await userModel.findOne({
      _id: userId,
    });

    let { userLogout, isDeleted,emailVerified,user_type } = userData;
    if(user_type === "guest" && emailVerified == false){
            const requestBody = req.body;

      let {
        first_name,
        last_name,
        email,
        password,
        mobile_number,
        avatar_id,
        avatar_index,
        user_profile,
        device_model,
        device_os,
        device_token,
        readyplayermeId,
        user_type
      } = requestBody;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }
      let newData = await userModel.findOneAndUpdate(
        { _id: userId },
        {
          first_name: first_name,
          last_name: last_name,
          user_type: user_type,
          email: email,
          password: password,
          avatar_id: avatar_id,
          avatar_index: avatar_index,
          mobile_number: mobile_number,
          user_profile: user_profile,
          device_model: device_model,
          device_os: device_os,
          device_token: device_token,
          readyplayermeId: readyplayermeId,
          user_type:user_type
        },
        { new: true }
      );

      return res.status(201).send({
        settings: {
          success: "1",
          message: "User Updated successfully",
          data: newData,
        },
      });
    }else{
      if(user_type != "guest" && emailVerified == false) return res.status(400).send({settings:{success:"0",message:"email is not verified"}})
      if (isDeleted == true)
        return res
          .status(400)
          .send({ settings: { success: "0", message: "User does not exist" } });
      if (userLogout === true)
        return res.status(400).send({
          settings: { success: "0", message: "You are not logged in " },
        });

      const requestBody = req.body;

      let {
        first_name,
        last_name,
        email,
        password,
        mobile_number,
        avatar_id,
        avatar_index,
        user_profile,
        device_model,
        device_os,
        device_token,
        readyplayermeId,
      } = requestBody;

      if (password) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
      }
      let newData = await userModel.findOneAndUpdate(
        { _id: userId },
        {
          first_name: first_name,
          last_name: last_name,
          user_type: user_type,
          email: email,
          password: password,
          avatar_id: avatar_id,
          avatar_index: avatar_index,
          mobile_number: mobile_number,
          user_profile: user_profile,
          device_model: device_model,
          device_os: device_os,
          device_token: device_token,
          readyplayermeId: readyplayermeId,
        },
        { new: true }
      );

      return res.status(201).send({
        settings: {
          success: "1",
          message: "User Updated successfully",
          data: newData,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete_account = async (req, res) => {
  try {
    const userId = req.user.userId;

    let userData = await userModel.findOne({
      _id: userId,
      emailVerified: true,
    });

    let { _id, isDeleted, userLogout } = userData;
    if (userLogout == true) {
      return res.status(400).send({
        settings: { success: "0", message: "You are not logged in " },
      });
    }

    if (isDeleted == true) {
      return res
        .status(400)
        .send({ settings: { success: "0", message: "User does not exist" } });
    }

    let newData = await userModel.findOneAndUpdate(
      { _id: _id },
      { isDeleted: true, deletedAt: Date(), userLogout: true },
      { new: true }
    );

    return res.status(201).send({
      settings: {
        success: 1,
        message: "You have successfully deleted Your account",
      },
      data: newData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user.userId;

    await userModel.findOneAndUpdate(
      { _id: userId },
      { userLogout: true },
      { new: true }
    );

    return res.status(200).send({
      settings: { success: "1", message: "You have successfully logged out" },
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.resend_otp = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({ _id: userId });

    if (!userId) {
      return res
        .status(400)
        .send({ settings: { success: "0", message: "User does not exist" } });
    }
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    let transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });
    let info = await transporter.sendMail({
      from: process.env.AUTH_EMAIL,
      to: userData.email,
      subject: "Verification mail by Balaji Yadav for testing api",
      text: `Your One Time Password is ${otp} for email verification`,
    });
    await userModel.updateOne({ _id: userId }, { otp: otp });
    return res
      .status(200)
      .send({ settings: { success: "1", message: "OTP sent to Your email " } });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// exports.otp_verifier = async (req, res) => {
//   try {
//     let userOtp = req.body.otp;
//     let userName = req.params.name;

//     let userData = await userModel.findOne({ otp: userName });

//     let { _id, email, otp, userLogout, first_name, last_name } = userData;
//     if (userLogout == true) {
//       await userModel.findOneAndUpdate({ _id: _id }, { userLogout: false });
//     }
//     if (otp != userOtp) {
//       return res.status(400).send({ message: "invalid OTP" });
//     }
//     let payload = { email: email };
//     const generatedToken = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: "10080m",
//     });
//     res.header("user-login-key", generatedToken);
//     return res.status(200).send({
//       status: true,
//       message: `${first_name} ${last_name} you have logged in successfully`,
//     });
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// };

exports.get_today_login_user = async (req, res) => {
  try {
    let date = new Date()
      .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
      .slice(0, 9);
    const userData = await userModel.find({ loginDate: date });

    return res.status(200).send({
      todaysLogin: userData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.add_loginDate_filed = async (req, res) => {
  try {
    const user = new Date().toISOString().split("T")[0];
    const number = new Date().toLocaleTimeString();
    const userData = await userModel.updateOne(
      { _id: "63033113902efb387b981f78" },
      { $set: { loginDate: user, loginTime: number } },
      { new: true }
    );

    return res.status(200).send({
      users: userData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.block_user = async (req, res) => {
  try {
    await userModel.updateOne(
      { _id: req.params.id },
      { isBlocked: true },
      { new: true }
    );
    return res
      .status(200)
      .send({ settings: { success: "1", message: "user blocked " } });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.unblock_user = async (req, res) => {
  try {
    await userModel.updateOne(
      { _id: req.params.id },
      { isBlocked: false },
      { new: true }
    );
    return res
      .status(200)
      .send({ settings: { success: "1", message: "user unblocked " } });
  } catch (err) {
    res.status(500).send(err.message);
  }
};