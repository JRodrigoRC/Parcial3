import mongoose from "mongoose";

const loginLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  expiryTimestamp: {
    type: Date,
    required: true
  },
  token: {
    type: String,
    required: true
  }
},{ versionKey: false });

const LoginLog = mongoose.models?.LoginLog || mongoose.model("LoginLog", loginLogSchema);
export default LoginLog;