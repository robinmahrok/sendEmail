const mongoose = require('mongoose');

let studentInfoSchema = new mongoose.Schema({
Name: {
    type: String
},
Email: {
    type: String
},
Password: {
    type: String
},
Otp :
{
    type:Number,
    default:0
},
OtpVerify:
{
    type:String
}
},{ timestamps: true });

const StudentInfo = mongoose.model("Signup", studentInfoSchema);
StudentInfo.getUserByEmail = (Email, callback) => {
    StudentInfo.findOne({ Email }, callback);
  }
  
  StudentInfo.updateOTP = (Email, Otp, callback) => {
    StudentInfo.findOneAndUpdate({ Email }, { $set: { Otp } }, { new: true }, callback)
  }

module.exports =StudentInfo;
