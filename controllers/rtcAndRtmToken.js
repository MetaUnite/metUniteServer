const {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("agora-access-token");
const userModel = require("../model/userModel");
const rtcCredential = require('../model/rtcCredential');

const appID = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;
// const uid = 2882341273;
// const account = "2882341273";
// const role = RtcRole.PUBLISHER;


const expirationTimeInSeconds = 3600;

const currentTimestamp = Math.floor(Date.now() / 1000);

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;


exports.generateRtcToken = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userData = await userModel.findOne({_id:userId});
    const channelName = req.body.meet_Id;
    const uid = userData.uid;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    console.log(`"uid"-${uid},"privilegeExpiredTs"-${privilegeExpiredTs},"role"-${role},"channelName"-${channelName},"appID"-${appID},"appCertificate"-${appCertificate}`);
    var token = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    ); 

   const rtcData = {uid,channelName,privilegeExpiredTs,token,appID}
   
    await rtcCredential.create(rtcData);
    res
      .status(201)
      .send({
        settings: {
          success: "1",
          message: "Rtc token created successfully",
        },
        data:{ token}
      });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.generateRtmToken = (req, res) => {
  try {
    const account = req.user.userId;
    var role = RtmRole.PUBLISHER;
    var token = RtmTokenBuilder.buildToken(
      appID,
      appCertificate,
      account,
      role,
      privilegeExpiredTs
    );
    res
      .status(201)
      .send({
        settings: {
          success: "1",
          message: "Rtm token created successfully",
        },
        data:{ token}
      });
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
