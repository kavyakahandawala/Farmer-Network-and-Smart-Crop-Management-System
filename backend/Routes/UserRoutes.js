const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  register,
  login,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateMyProfile,
  deleteMyProfile,
  getMyProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  generateUserPdf, // ✅ PDF generation
} = require("../Controllers/UserController");

const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");
const { getLandsByFarmer } = require("../Controllers/LandController"); // new

// Multer setup for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// -------------------- Public --------------------
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// -------------------- Farmer (self-service) --------------------
router.get("/me", verifyToken, getMyProfile);
router.put("/me/update", verifyToken, updateMyProfile);
router.delete("/me/delete", verifyToken, deleteMyProfile);
router.put("/me/change-password", verifyToken, changePassword);

// Profile picture upload
router.put("/me/profile-pic", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    const User = require("../Model/UserModel");
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const profileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profileUrl },
      { new: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PDF download route (Farmer only)
router.get("/me/pdf", verifyToken, generateUserPdf);

// -------------------- Farmer lands --------------------
// Fetch lands for the logged-in farmer (for PDF)
router.get("/lands/farmer/:id", verifyToken, getLandsByFarmer);

// -------------------- Admin-only --------------------
router.get("/", verifyToken, verifyAdmin, getAllUsers);
router.get("/:id", verifyToken, verifyAdmin, getUser);
router.put("/:id", verifyToken, verifyAdmin, updateUser);
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);
router.put("/:id/role", verifyToken, verifyAdmin, updateUserRole);

module.exports = router;
