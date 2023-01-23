const roomModel = require("../model/roomModel");
const generator = require("generate-password");
const userModel = require("../model/userModel");
const aws = require("./aws");
const multer = require("multer");
const uuid = require("uuid").v4;
//const fs = require("fs");
//const util = require("util");
//const unlinkFile = util.promisify(fs.unlink);

const storage = multer.memoryStorage();

const fileFilter = async (req, file, cd) => {
  if (file.mimetype.split("/")[0] === "image/png") {
    cd(null, true);
  } else {
    cd(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100000000, files: 2 },
});

exports.create_room =
  (upload.single("file"),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const userType = req.user.user_type;
      const userData = await userModel.findOne({ _id: userId });
      if (!userData.user_type) {
        if (userData.emailVerified === false)
          return res.status(403).send({
            settings: {
              success: "0",
              message: "email is not verified, Please verify your email",
            },
          });

        if (userData.isDeleted === true)
          return res
            .status(403)
            .send({ settings: { success: "0", message: "user is deleted" } });

        if (userData.userLogout === true)
          return res
            .status(403)
            .send({
              settings: { success: "0", message: "user is logged out" },
            });
        let id = "";
        id = generator.generateMultiple(1, {
          length: 10,
          uppercase: false,
        });
        const meet_Id = id[0];
        const environmentId = req.body.environmentId;
        if (!req.files) {
          const createdBy = userData.first_name + " " + userData.last_name;
          const meetDate = new Date()
            .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
            .slice(0, 9);

          const meetTime = new Date()
            .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
            .slice(11);
          const roomRequest = {
            meet_Id,
            environmentId,
            createdBy,
            meetDate,
            meetTime,
          };
          const roomData = await roomModel.create(roomRequest);
          return res.status(201).send({
            settings: { success: "1", message: "room created successfully" },
            data: roomData,
          });
        } else {
          const file = req.files[0];
          const result = await aws.uploadFile(file);
          const add_image = result.Location;
          const createdBy = userData.first_name + " " + userData.last_name;
          const meetDate = new Date()
            .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
            .slice(0, 9);

          const meetTime = new Date()
            .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
            .slice(11);
          const roomRequest = {
            meet_Id,
            environmentId,
            add_image,
            meetDate,
            meetTime,
            createdBy,
          };
          const roomData = await roomModel.create(roomRequest);
          return res.status(201).send({
            settings: { success: "1", message: "room created successfully" },
            data: roomData,
          });
        }
      }else{
        res.status(400).send({message:"you are not authorized"})
      }
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });

exports.join_room = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({ _id: userId, userBlock: false });
    if (!userData)
      return res.status(400).send({
        settings: { success: "0", message: "You are not authorized" },
      });

    const { first_name, last_name, email, userLogout, isDeleted,user_type } = userData;
    if (isDeleted == true)
      return res
        .status(400)
        .send({ settings: { success: "0", message: "user does not exist" } });
    // if (userLogout === true)
    //   return res.status(400).send({
    //     settings: { success: "0", message: "You are not logged in " },
    //   });

    const meet_Id = req.body.meetId;

    const isMeet_id_valid = await roomModel.findOne({ meet_Id: meet_Id });
    if (!isMeet_id_valid)
      return res
        .status(400)
        .send({ settings: { success: "0", message: "invalid meet id" } });

    const userJoined = isMeet_id_valid.participants.filter(
      (joiner) => joiner.userId == userId
    );
    if (userJoined.length > 0)
      return res
        .status(400)
        .send({ settings: { success: "0", message: "user already joined" } });
    const user_name = first_name + " " + last_name;
    const joinTime = new Date()
      .toLocaleString(undefined, { timeZone: "Asia/Kolkata" })
      .slice(11);
    const user = { user_name, email, userId, joinTime,user_type };
    await roomModel.updateOne(
      { meet_Id: meet_Id },
      { $push: { participants: user } }
    );
    return res.status(200).send({
      settings: {
        success: "1",
        message: "You have joined meeting successfully",
      },
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.fetch_room_data = async (req, res) => {
  try {
    const meetId = req.body.meetId;
    const roomData = await roomModel.findOne({ meet_Id: meetId });
    if (!roomData)
      return res
        .status(403)
        .send({ settings: { success: "0", message: "room not found" } });
    return res.status(200).send({
      settings: {
        success: "1",
        message: "room fetched successfully",
      },
      data: roomData,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.get_all_room = async (req, res) => {
  try {
    const roomData = await roomModel.find();

    return res.status(200).send({
      settings: {
        success: "1",
        message: "room fetched successfully",
      },
      room: roomData,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.add_meetDate_filed = async (req, res) => {
  try {
    const userData = await userModel.updateMany(
      {},
      { $set: { user_type: "" } },
      { new: true }
    );

    return res.status(200).send({
      users: userData,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete_room = async (req, res) => {
  try {
    const roomId = req.params.id;
    const roomData = await roomModel.findOne({ _id: roomId });
    if (!roomData)
      return res
        .status(403)
        .send({ settings: { success: "0", message: "room not found" } });
    await roomModel.deleteOne({ _id: roomId }, { new: true });
    return res.status(200).send({
      settings: {
        success: "1",
        message: "room deleted successfully",
      },
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
