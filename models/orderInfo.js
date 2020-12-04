const mongoose = require('mongoose');

let orderInfoSchema = new mongoose.Schema({
Email: {
    type: String
},
Items: [[{
    type: String
}]],
price:{
    type:Number
},
taken :
{
    type:Boolean,
    default:false
},
orderNo:
{
    type:String
},
accepted :
{
    type:Boolean,
    default:false
},
},{ timestamps: true });

const OrderInfo = mongoose.model("Order", orderInfoSchema);
OrderInfo.getUserByEmail = (Email, callback) => {
    OrderInfo.findOne({ Email }, callback);
  }
  
  OrderInfo.updateOrder = (Email, Otp, callback) => {
    OrderInfo.findOneAndUpdate({ Email }, { $set: { Items,orderNo, price } }, { new: true }, callback)
  }

module.exports = OrderInfo;
