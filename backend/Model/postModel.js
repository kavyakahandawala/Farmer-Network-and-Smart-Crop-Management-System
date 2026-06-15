const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
    creatorName:{
        type:String,
        required:true,
    },
    creatorEmail:{
        type:String,
        required:true,
    },
    creatorPhone:{
        type:String,
        required:true,
    },
    creatorQuestion:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    postCreatedDate:{
        type:Date,
        default:Date.now,
    },
    reply: [
    {
      responderName: { type: String, required: true },
      responderEmail: { type: String, required: true },
      responderAnswer: { type: String, required: true },
      respondCreatedDate: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model(
    "postModel",
    postSchema
)