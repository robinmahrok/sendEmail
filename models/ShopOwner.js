const mongoose = require('mongoose');

const shopOwnerSchema = new mongoose.Schema({
ShopName: {
    type: String,
},
Email: {
    type: String,

},
Password: {
    type: String,

},
Otp :
{
    type:Number,
    default:0
},
OtpVerify: {
    type: String,
    default:"Pending"
},
Owner:
{
    type:String,
}
});

const ShopOwner = mongoose.model("ShopOwner", shopOwnerSchema);

module.exports =ShopOwner;