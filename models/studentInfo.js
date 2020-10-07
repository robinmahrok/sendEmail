const mongoose = require('mongoose');

const studentInfoSchema = new mongoose.Schema({
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
});


module.exports = mongoose.model("Signup", studentInfoSchema);