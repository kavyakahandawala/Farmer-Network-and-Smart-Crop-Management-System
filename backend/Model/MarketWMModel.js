const mongoose = require("mongoose")
const schema = mongoose.Schema;

const MarketWMSchema = new schema({
 
cropName:{
    type:String,// data type
    required:true,//validate
 },
marketLocation:{
    type:String,// data type
    required:true,//validate
 },
 pricePerKg:{
    type:Number,// data type
    required:true,//validate
 },
 priceDate:{
    type:Date,// data type
    required:true,//validate
 },
 TrendIndicator:{
    type:String,// data type
    enum:["Rising","Falling","Stable"]
 }
 
});
module.exports = mongoose.model(
    "MarketWMModel",//file name
    MarketWMSchema // function name
)