const userModel = require("../model/userModel");

exports.device_token = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userData = await userModel.findOneAndUpdate(
      { _id: userId },
      { device_token: device_token },
      { new: true }
    );

    return res.status(201).send({
      settings: { success: "1", message: "Device Token changed successfully" },
      data: userData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
