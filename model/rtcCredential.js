const mongoose = require('mongoose');

const rtcSchema = new mongoose.Schema({
    uid:{
        type:String,
        trim:true
    },
    channelName:{
        type:String,
        trim:true
    },
    privilegeExpiredTs:{
        type:String,
        trim:true
    },
    token:{
        type:String,
        trim:true
    },
    appID:{
        type:String,
        trim:true
    }
},{timestamps:true})

module.exports=mongoose.model('rtcCredential',rtcSchema);