const axios = require("axios");


const Authorization = `Basic ${Buffer.from(`${process.env.RESTkey}:${process.env.RESTsecret}`).toString("base64")}`;

exports.acquire = async (req, res) => {
    try {
        const acquire = await axios.post(
          `https://api.agora.io/v1/apps/${process.env.APP_ID}/cloud_recording/acquire`,
          {
            cname: req.body.channel,
            uid: req.body.uid,
            clientRequest: {
              resourceExpiredHour: 24,
            },
          },
          { headers: { Authorization } }
        );
      
        res.send({settings: { success: "1", message: "token acquired successfully" }, data: acquire.data});
    } catch (error) {
      console.log(error.message);
      res.send(error);
    }
}


exports.start = async (req, res) => {
    try {
        //const appID = process.env.appID;
        const resource = req.body.resource;
      
        const start = await axios.post(
          `https://api.agora.io/v1/apps/${process.env.APP_ID}/cloud_recording/resourceid/${resource}/mode/mix/start`,
          {
            cname: req.body.channel,
            uid: req.body.uid,
            clientRequest: {
              recordingConfig: {
                maxIdleTime: 30,
                streamTypes: 2,
                channelType: 0,
                videoStreamType: 0,
                transcodingConfig: {
                  height: 640,
                  width: 360,
                  bitrate: 400,
                  fps: 15,
                  mixedVideoLayout: 1,
                  backgroundColor: "#FFFFFF",
                },
              },
              recordingFileConfig: {
                avFileType: ["hls"],
              },
              storageConfig: {
                vendor: 1,
                region: 20,      
                bucket: "meta-unite-recording-video",
                accessKey: process.env.AWS_ACCESS_KEY_ID,
                secretKey: process.env.AWS_SECRET_ACCESS_KEY,
                fileNamePrefix: ["directory1", "directory2"],
              },
            },
          },
          { headers: { Authorization } }
         
        );
      
        res.send({settings: { success: "1", message: "recording started successfully " },data:start.data});
        } catch (error) {
          console.log(error.message);
          res.send(error.message);
        }
}

exports.stop = async (req, res) => {
    try {
        const resource = req.body.resource;
        const sid = req.body.sid;
      
        const stop = await axios.post(
          `https://api.agora.io/v1/apps/${process.env.APP_ID}/cloud_recording/resourceid/${resource}/sid/${sid}/mode/mix/stop`,
          {
            cname: req.body.channel,
            uid: req.body.uid,
            clientRequest: {
              async_stop: false,
            },
          },
          { headers: { Authorization } }
        );
        res.send({settings: { success: "1", message: "recording stopped successfully" },data:stop.data});
      } catch (error) {
        console.log(error);
        res.send(error);
      }
}
