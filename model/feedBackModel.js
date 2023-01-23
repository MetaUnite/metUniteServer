const mongoose = require('mongoose');

const feedBackSchema = new mongoose.Schema({
    user_name:{
        type:String,
        trim:true
    },
    email:{
        type:String,
        trim:true
    },
    feedback:{
        type:String,
        trim:true
    },
    rating:{
        type:String,
        required:true,
        trim:true
    },
    app_version:{
        type:String,
        required:true,
        trim:true
    },
    device_model:{
        type:String,
        required:true,
        trim:true
    },
    device_type:{
        type:String,
        required:true,
        trim:true
    },
    device_name:{
        type:String,
        required:true,
        trim:true
    },
    device_os:{
        type:String,
        required:true,
        trim:true
    }
})

module.exports=mongoose.model('feedBack',feedBackSchema)