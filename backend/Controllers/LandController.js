// backend/Controller/LandController.js
const Land = require("../Model/LandModel");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid"); // for generating unique landId

// ✅ Joi validation schema (match model fields)
const landSchema = Joi.object({
  farmerId: Joi.string().optional(),
  landName: Joi.string().min(3).required(),
  locationDistrict: Joi.string().min(3).required(),
  landSize: Joi.number().positive().required(),
  gpsCoordinates: Joi.string().optional(),
  soilType: Joi.string().optional(),
  landPhoto: Joi.string().optional(),
});

// ✅ Add land (farmer or admin)
const addLand = async (req, res, next) => {
  try {
    // Build clean data object (convert strings properly from multipart/form-data)
    const data = {
      farmerId: req.user.role === "admin" ? req.body.farmerId : req.user.id,
      landName: req.body.landName,
      locationDistrict: req.body.locationDistrict,
      landSize: Number(req.body.landSize), // convert string → number
      gpsCoordinates: req.body.gpsCoordinates,
      soilType: req.body.soilType,
      landPhoto: req.file ? `/uploads/lands/${req.file.filename}` : req.body.landPhoto,
    };

    // Validate with Joi
    const { error } = landSchema.validate(data);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Save land
    const land = new Land({
      ...data,
      landId: uuidv4(), // generate unique ID
    });

    await land.save();
    return res.status(201).json({ message: "Land added successfully", land });
  } catch (err) {
    next(err);
  }
};

const getLandsByFarmer = async (req, res, next) => {
  try {
    let farmerId;

    // If admin and accessing /farmer/:userId
    if (req.user.role === "admin" && req.params.userId) {
      farmerId = req.params.userId;
    } else {
      // If farmer or admin accessing /farmer/me
      farmerId = req.user.id;
    }

    const lands = await Land.find({ farmerId });
    return res.status(200).json(lands);
  } catch (err) {
    next(err);
  }
};



// ✅ Get all lands (admin only)
const getAllLands = async (req, res, next) => {
  try {
    const lands = await Land.find().populate("farmerId", "fullName email");
    return res.status(200).json(lands);
  } catch (err) {
    next(err);
  }
};

// ✅ Update land
const updateLand = async (req, res, next) => {
  try {
    // Convert strings from multipart/form-data
    const data = {
      ...req.body,
      landSize: req.body.landSize ? Number(req.body.landSize) : undefined,
    };

    const { error } = landSchema.validate(data);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (req.user.role !== "admin" && land.farmerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    if (req.file) data.landPhoto = `/uploads/lands/${req.file.filename}`;

    const updatedLand = await Land.findByIdAndUpdate(req.params.id, data, { new: true });
    return res.status(200).json({ message: "Land updated successfully", updatedLand });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete land
const deleteLand = async (req, res, next) => {
  try {
    const land = await Land.findById(req.params.id);
    if (!land) return res.status(404).json({ message: "Land not found" });

    if (req.user.role !== "admin" && land.farmerId.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    await Land.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Land deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addLand,
  getLandsByFarmer,
  getAllLands,
  updateLand,
  deleteLand,
};
