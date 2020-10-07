const mongoose = require('mongoose');

const shopOwnerSchema = new mongoose.Schema({
Name: {
    type: String,
    required: true
},
Email: {
    type: String,
    required: true
},
Password: {
    type: String,
    required: true
},
Otp :
{
    type:Number,
    required:true,
    default:0
}
});


module.exports = mongoose.model("ShopOwner", shopOwnerSchema);