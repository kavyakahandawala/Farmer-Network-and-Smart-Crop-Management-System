const express = require("express");
const router = express.Router();
const OrderController = require("../Controllers/OrderController");
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

router.post("/", authMiddleware(), OrderController.createOrder);
router.get("/", authMiddleware('admin'), OrderController.getAllOrders);
router.get("/:id", authMiddleware(), OrderController.getOrderById);
router.put("/:id", authMiddleware('admin'), OrderController.updateOrder);
router.delete("/:id", authMiddleware('admin'), OrderController.deleteOrder);

module.exports = router;