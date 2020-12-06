const mongoose = require('mongoose');

let allOrdersSchema = new mongoose.Schema({
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
    type:Number,
    default:0
},
},{ timestamps: true });

const AllOrders = mongoose.model("AllOrders", allOrdersSchema);
AllOrders.getUserByEmail = (Email, callback) => {
    AllOrders.findOne({ Email }, callback);
  }
  
  AllOrders.updateOrder = (Email, callback) => {
    AllOrders.findOneAndUpdate({ Email }, { $set: { Items,orderNo, price } }, { new: true }, callback)
  }

module.exports = AllOrders;
