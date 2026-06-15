const express = require("express");
const router = express.Router();
//insert model
const Crop = require("../Model/CropTrackerModel");
//insert crops controller
const CropTrackerController = require("../Controllers/CropTrackerController");
const { verifyToken } = require("../Middleware/authMiddleware");

router.get("/",verifyToken,CropTrackerController.getAllCrops);
router.post("/",verifyToken,CropTrackerController.addCrops);
router.get("/:id",verifyToken,CropTrackerController.getById);
router.put("/:id",verifyToken,CropTrackerController.updateCrop);
router.delete("/:id",verifyToken,CropTrackerController.deleteCrop);

//export
module.exports = router;