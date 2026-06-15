const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const landSchema = new Schema({
  landId: { type: String, required: true, unique: true }, // custom land identifier
  farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // owner
  landName: { type: String, required: true },
  locationDistrict: { type: String, required: true },
  gpsCoordinates: { type: String },
  landSize: { type: Number, required: true },
  soilType: { type: String },
  landPhoto: { type: String }, // path/url of uploaded image
}, { timestamps: true });

module.exports = mongoose.model("Land", landSchema);
