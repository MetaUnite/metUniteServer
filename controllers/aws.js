const {S3} = require("aws-sdk"); // Software developmwnt kit (sdk)
const uuid = require("uuid").v4;

// aws.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY, // process.env.ACCESS
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

exports.uploadFile = async (file) => {
  try {
      let s3 = new S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // process.env.ACCESS
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
      var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `addImage/${uuid()}-${file.originalname}`, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
        Body: file.buffer,
      };
     return s3.upload(params).promise();

  //    var params =files.map((file) => {
  //     return{
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Key: `addImage/${uuid()}-${file.originalname}`, // HERE    "pk_newFolder/harry-potter.png" pk_newFolder/harry-potter.png
  //     Body: file.buffer,
  //     };
  //   })
  //  return await Promise.all(params.map((param)=> s3.upload(params).promise()));
  } catch (err) {
    console.log(err.message);
  }
};

// exports.myAws = async (req, res) => {
//     try {
//         let files = req.files;
//         if (files && files.length > 0) {
//             let uploadedFileURL = await uploadFile(files[0]);
//             res.status(201).send({ status: true, data: uploadedFileURL });
//         }
//         else {
//             res.status(400).send({ status: false, msg: "No file to write" });
//         }
//     }
//     catch (err) {
//         console.log("error is: ", err);
//         res.status(500).send({ status: false, msg: "Error in uploading file to s3" });
//     }
// };

// require("dotenv").config();
// const S3 = require("aws-sdk/clients/s3");
// const fs = require("fs");

// const bucketName = process.env.AWS_BUCKET_NAME;
// const region = process.env.AWS_BUCKET_REGION;
// const accessKeyId = process.env.AWS_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_SECRET_KEY;

// const s3 = new S3({
//   region,
//   accessKeyId,
//   secretAccessKey,
// });

// // uploads a file to s3
// function uploadFile(file) {
//   console.log(file);
//   // path is in uploads\\63b0a2fed4a70cf8ed0ad1bcbcf5a2d1 format
//   const fileStream = fs.createReadStream("C:/Users/Balaji Yadav/OneDrive/Desktop/logsignup/uploads/903317a60539c39825d45f0584191769.jpg");

//   const uploadParams = {
//     Bucket: bucketName,
//     Body: fileStream,
//     Key: file.filename,
//   };

//   return s3.upload(uploadParams).promise();
// }
// exports.uploadFile = uploadFile;

// // downloads a file from s3
// function getFileStream(fileKey) {
//   const downloadParams = {
//     Key: fileKey,
//     Bucket: bucketName,
//   };

//   return s3.getObject(downloadParams).createReadStream();
// }
// exports.getFileStream = getFileStream;

// const storage = multer.memoryStorage()

// const fileFilter = async (req,file, cd) => {
//     if(file.mimetype.split('/')[0] === 'image/png' ){
//         cd(null, true)
//     }else{
//       cd(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false)
//     }
// }

// const upload = multer({storage, fileFilter,limits:{fileSize:100000000,files:2},});

// exports.upload_file = (upload.single('file'),async (req,res)=>{
//   const file = req.files[0];
//   const result = await uploadFile(file);
//   res.send({status:"success",result:result});
// });
