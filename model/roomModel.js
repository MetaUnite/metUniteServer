const mongoose = require("mongoose");


const roomSchema = new mongoose.Schema({
    createdBy:{
        type:String,
        trim:true
    },
    meet_Id :{
        type:String,
        unique:true,
        trim:true,
        required:true
    },
     add_image:{
        type:String,
        trim:true
    },
    environmentId:{
        type:String
        
    },
    participants:[Object],
    isDeleted:{
        type:Boolean,
        default:false,
        trim:true
    },
    meetDate:{
        type:String,
        trim:true,
      },
    meetTime:{
        type:String,
        trim:true,
      },
    // expireAt: {type: Date, default: Date.now, expires: 7200}
},{timestamps:true});

module.exports=mongoose.model('room',roomSchema);