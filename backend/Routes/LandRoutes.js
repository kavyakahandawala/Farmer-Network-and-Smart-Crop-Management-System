const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  addLand,
  getLandsByFarmer,
  getAllLands,
  updateLand,
  deleteLand,
} = require("../Controllers/LandController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// ✅ Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/lands"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// -------------------- ROUTES --------------------

// Farmers add land (must be logged in)
router.post("/", verifyToken, upload.single("landPhoto"), addLand);

// Farmers view their own lands (JWT-based)
router.get("/farmer/me", verifyToken, getLandsByFarmer);

// Admin: view any farmer lands
router.get("/farmer/:userId", verifyToken, verifyAdmin, getLandsByFarmer);

// Farmers update/delete their own lands
router.put("/:id", verifyToken, upload.single("landPhoto"), updateLand);
router.delete("/:id", verifyToken, deleteLand);

// Admin: view all lands
router.get("/", verifyToken, verifyAdmin, getAllLands);

// Admin: add land
router.post("/admin", verifyToken, verifyAdmin, upload.single("landPhoto"), addLand);

// Admin: update land
router.put("/admin/:id", verifyToken, verifyAdmin, upload.single("landPhoto"), updateLand);

// Admin: delete land
router.delete("/admin/:id", verifyToken, verifyAdmin, deleteLand);

module.exports = router;
