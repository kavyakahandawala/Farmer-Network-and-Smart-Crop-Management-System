const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cropTrackerSchema = new Schema({
    cropLabel:{
        type:String,
        required:true,
    },
    cropName:{
        type:String,
        required:true,
    },
    plot:{
        type:String,
        required:true,
    },
    growthStage:{
        type:String,
        required:true,
    },
    healthStatus:{
        type:String,
        required:true,
    },
    plantingDate:{
        type:Date,
        required:true,
    },
    harvestingDate:{
        type:Date,
        required:true,
    },
    expectedYield:{
        type:Number,
        required:true,
    },
    userId: {
        type: String, // Since your token stores id as string
        required: true
    }
});
module.exports = mongoose.model(
    "CropTrackerModel",
    cropTrackerSchema
)