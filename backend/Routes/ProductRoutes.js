const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'Uploads/' });

// Insert Model
const Product = require('../Model/ProductModel');
// Insert Product Controller
const ProductController = require('../Controllers/ProductController');

// Authentication middleware for admin-only routes
const jwt = require('jsonwebtoken');
const authMiddleware = (role) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    if (role && decoded.role !== role) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/', ProductController.getAllProducts);
router.post('/', upload.single('image'), ProductController.addProduct);
router.get('/:id', ProductController.getById);
router.put('/:id',  upload.single('image'), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

// Export
module.exports = router;