const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forumSchema = new Schema({
    question:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    createdDate:{
        type:Date,
        default:Date.now,
    }
});

module.exports = mongoose.model(
    "QandAModel",
    forumSchema
)