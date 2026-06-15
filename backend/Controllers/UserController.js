const User = require("../Model/UserModel");
const Land = require("../Model/LandModel"); // Land model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const nodemailer = require("nodemailer");
const resetCodes = require("./resetCodes"); // In-memory reset codes
const PDFDocument = require("pdfkit");

// --------------------- Joi validation schema ---------------------
const userSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  age: Joi.number().min(18).required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  address: Joi.string().required(),
  phone: Joi.string().min(10).required(),
  email: Joi.string().email().required(),
  username: Joi.string().min(4).required(),
  password: Joi.string().min(6).required(),
  district: Joi.string().required(),
});

// --------------------- Register ---------------------
const register = async (req, res, next) => {
  try {
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Default profile picture path
    const defaultProfilePic = "/uploads/default.png"; // make sure this image exists

    const user = new User({ 
      ...req.body, 
      password: hashedPassword, 
      role: "farmer",
      profilePicture: defaultProfilePic 
    });

    await user.save();

    return res.status(201).json({ message: "Farmer registered successfully", user });
  } catch (err) {
    next(err);
  }
};

// --------------------- Login ---------------------
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, role: user.role, username: user.username }
    });
  } catch (err) {
    next(err);
  }
};

// --------------------- Admin CRUD ---------------------
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["farmer", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Role updated successfully", user });
  } catch (err) {
    next(err);
  }
};

// --------------------- Self-service ---------------------
const updateMyProfile = async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "Profile updated successfully", user });
  } catch (err) {
    next(err);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const deleteMyProfile = async (req, res, next) => {
  try {
    await Land.deleteMany({ farmerId: req.user.id });
    await User.findByIdAndDelete(req.user.id);
    return res.status(200).json({ message: "Profile and associated lands deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// --------------------- Password Reset ---------------------
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    resetCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER_KAVYA, pass: process.env.EMAIL_PASS_KAVYA },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER_KAVYA,
      to: email,
      subject: "Password Reset Code",
      text: `Your password reset code is ${code}. It expires in 10 minutes.`,
    });

    res.json({ message: "✅ Reset code sent to email" });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    const record = resetCodes[email];

    if (!record || record.code !== code || record.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    delete resetCodes[email];

    res.json({ message: "✅ Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

// --------------------- Professional PDF Generation ---------------------
const generateUserPdf = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const lands = await Land.find({ farmerId: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found" });

    const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
    let filename = `${user.fullName.replace(/\s/g, "_")}_Profile.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");

    // ---------------- Header ----------------
    doc.fillColor("#2e7d32").fontSize(24).text("AgroSphere", { align: "center" });
    doc.moveDown(0.3).fontSize(16).fillColor("#000000").text("User Profile Report", { align: "center" });

    const formattedDate = new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
    doc.fontSize(10).fillColor("#555555").text(`Generated on: ${formattedDate}`, 400, 90, { align: "right" });

    doc.moveDown(0.5).strokeColor("#2e7d32").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Section header helper
    const drawSectionHeader = (text, y) => {
      doc.save();
      doc.rect(48, y - 4, 500, 22).fillOpacity(0.1).fill("#2e7d32");
      doc.fillOpacity(1);
      doc.fillColor("#2e7d32").fontSize(16).font("Helvetica-Bold").text(text, 50, y, { underline: true });
      doc.restore();
      return y + 28;
    };

    // ---------------- User Details ----------------
    let currentY = drawSectionHeader("User Details", doc.y);
    doc.moveDown(0.5);

    const rowHeight = 28;
    const userTableTop = currentY;
    const userHeaders = ["Field", "Value"];
    const userData = [
      ["Full Name", user.fullName],
      ["Email", user.email],
      ["Phone", user.phone],
      ["District", user.district],
      ["Address", user.address],
    ];
    const userColPositions = [50, 200];
    const userColWidths = [140, 300];

    doc.fillColor("#2e7d32").rect(50, userTableTop, 450, rowHeight).fill();
    doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");
    userHeaders.forEach((header, i) => {
      doc.text(header, userColPositions[i] + 5, userTableTop + 8, { width: userColWidths[i] - 10 });
    });

    userData.forEach((row, i) => {
      const y = userTableTop + rowHeight + i * rowHeight;
      doc.fillColor(i % 2 === 0 ? "#f1f8f4" : "#ffffff").rect(50, y, 450, rowHeight).fill();
      doc.fillColor("#000000").font("Helvetica").fontSize(11);
      row.forEach((text, j) => {
        doc.text(text, userColPositions[j] + 5, y + 8, { width: userColWidths[j] - 10 });
      });
    });

    const totalUserRowsHeight = rowHeight * (userData.length + 1);
    doc.strokeColor("#2e7d32").lineWidth(0.5).rect(50, userTableTop, 450, totalUserRowsHeight).stroke();
    currentY = userTableTop + totalUserRowsHeight + 20;

    // ---------------- Land Details ----------------
    currentY = drawSectionHeader("Land Details", currentY);
    doc.moveDown(0.5);

    if (lands.length > 0) {
      const tableTop = currentY;
      const landRowHeight = 35; // larger for GPS
      const headers = ["No.", "Land Name", "District", "GPS", "Size", "Soil Type"];
      const colPositions = [50, 80, 220, 310, 410, 470]; // adjusted
      const colWidths = [30, 140, 90, 100, 60, 75];

      // Header
      doc.fillColor("#2e7d32").rect(50, tableTop, 495, landRowHeight).fill();
      doc.fillColor("#ffffff").fontSize(12).font("Helvetica-Bold");
      headers.forEach((header, i) => {
        doc.text(header, colPositions[i] + 3, tableTop + 8, { width: colWidths[i] - 6 });
      });

      // Rows
      lands.forEach((land, i) => {
        let y = tableTop + landRowHeight + i * landRowHeight;
        if (y + landRowHeight > 780) {
          doc.addPage();
          y = 50;
        }
        doc.fillColor(i % 2 === 0 ? "#f1f8f4" : "#ffffff").rect(50, y, 495, landRowHeight).fill();
        doc.fillColor("#000000").font("Helvetica").fontSize(11);

        const landValues = [
          i + 1,
          land.landName,
          land.locationDistrict || "-",
          land.gpsCoordinates || "-",
          land.landSize,
          land.soilType || "-",
        ];
        landValues.forEach((text, j) => {
          doc.text(text, colPositions[j] + 3, y + 10, { width: colWidths[j] - 6 });
        });
      });

      const totalRowsHeight = landRowHeight * (lands.length + 1);
      doc.strokeColor("#2e7d32").lineWidth(0.5).rect(50, tableTop, 495, totalRowsHeight).stroke();
      colPositions.slice(1).forEach((pos) => {
        doc.moveTo(pos, tableTop).lineTo(pos, tableTop + totalRowsHeight).stroke();
      });
    } else {
      doc.fillColor("#000000").fontSize(12).text("No land added yet.", { indent: 20 });
    }

    // ---------------- Footer ----------------
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor("#808080").text(`Page ${i + 1} of ${pageCount}`, 50, 780, { align: "center" });
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  updateMyProfile,
  getMyProfile,
  deleteMyProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  generateUserPdf,
};
