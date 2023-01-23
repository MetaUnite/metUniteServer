const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    user_type: {
      type: String,
      trim: true,
      default:""
    },
    email: {
      type: String,
      trim:true
    },
    password: {
      type: String,
      trim: true,
    },
    mobile_number: {
      type: String,
      trim: true,
    },
    user_profile: {
      type: String,
      trim: true,
    },
    device_model: {
      type: String,
      trim: true,
    },
    device_os: {
      type: String,
      trim: true,
    },
    device_token: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      default: null,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    userLogout: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    avatar_id: {
      type: String,
      default: "0",
      trim: true,
    },
    avatar_index: {
      type: String,
      default: "0",
      trim: true,
    },
    readyplayermeId: {
      type: String,
      trim: true,
      default: "",
    },
    loginDate: {
      type: String,
      trim: true,
    },
    loginTime: {
      type: String,
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    uid: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
