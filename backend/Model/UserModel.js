const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: {
    type: String,
    default: "http://localhost:5000/uploads/default.png",
  },
  district: { type: String, required: true },
  role: { type: String, default: "farmer", enum: ["farmer", "admin"] },

  // Fields for password reset
  resetCode: String,
  resetCodeExpires: Date,
}, { timestamps: true });

userSchema.index({ fullName: 1, district: 1 });

module.exports = mongoose.model("User", userSchema);
