const mongoose = require('mongoose');

let orderInfoSchema = new mongoose.Schema({
Email : {
    type: String
},
Items : [[{
    type: String
}]],
price:{
    type:Number
},
taken :
{
    type:Number,
    default:0
},
restrau :
{
    type:String
},
shop :
{
    type:String,
    default:"Annapurna"
},
orderNo :
{
    type:String
},
accepted :
{
    type:Number,
    default:0
},
},{ timestamps: true });

const OrderInfo = mongoose.model("Order", orderInfoSchema);
OrderInfo.getUserByEmail = (Email, callback) => {
    OrderInfo.findOne({ Email }, callback);
  }
  
  OrderInfo.updateOrder = (Email, callback) => {
    OrderInfo.findOneAndUpdate({ Email }, { $set: { Items,orderNo, price } }, { new: true }, callback)
  }

module.exports = OrderInfo;
