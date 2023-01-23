const feedBackModel = require("../model/feedBackModel");
const userModel = require("../model/userModel");

exports.post_feedBack = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({
      _id: userId,
      emailVerified: true,
    });
    if(!userData){
      let { _id, userLogout, isDeleted, first_name, last_name, email,user_type } = userData;
      if (isDeleted == true)
        return res.status(400).send({ message: "user does not exist" });
      if (userLogout === true)
        return res.status(400).send({ message: "You are not log in " });
      let user_name = first_name + " " + last_name;
      const {
        feedback,
        rating,
        app_version,
        device_model,
        device_type,
        device_name,
        device_os,
      } = req.body;
      const feedBackData = {
        feedback,
        rating,
        app_version,
        device_model,
        device_type,
        device_name,
        device_os,
        user_name,
        email,
      };
  
      const feedBack = await feedBackModel.create(feedBackData);
  
      return res.status(201).send({
        settings: {
          success: "1",
          message: 'You have successfully posted your feedback." ',
          FeedBack: feedBack,
        },
      });
    }else{
      res.status(400).send({message:"you are not authorized"})
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.get_feedBack = async (req, res) => {
  try {
    const feedBack = await feedBackModel.find();
    return res.status(200).send({
      settings: { success: "1", message: "feedBack found successfully" },
      data: feedBack,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
