// server.js (or your main server file)
require("dotenv").config(); // load env variables
const express = require("express");    
const mongoose = require("mongoose"); 
const cors = require("cors");
const dotenv = require('dotenv');
const path = require('path');
const productRoutes = require('./Routes/ProductRoutes');
const billingRoutes = require('./Routes/BillingRoutes');
const paymentRoutes = require('./Routes/PaymentRoutes');
const orderRoutes = require('./Routes/OrderRoutes');
const notificationRoutes = require('./Routes/NotificationRoutes');
const routerCrop =require("./Routes/CropTrackerRoute");
const routerQ = require("./Routes/QandARoute");
const routerPost = require("./Routes/postRoute");
const routerMarket = require("./Routes/MarketWMRoute");
const userRoutes = require("./Routes/UserRoutes");
const landRoutes = require("./Routes/LandRoutes");

require('./Model/BillingModel');
require('./Model/PaymentModel');
require('./Model/NotificationModel');
require('dotenv').config();

dotenv.config();
console.log('Main: EMAIL_USER:', process.env.EMAIL_USER);
console.log('Main: EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');
console.log('Main: MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Missing');
console.log('Main: PORT:', process.env.PORT || 5000);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
app.use(express.urlencoded({ extended: true }));
app.use('/Uploads', express.static('Uploads'));
app.use('/invoices', express.static('invoices'));

// Routes
console.log('App.js: Mounting routes');
app.use('/api/products', productRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use("/crops",routerCrop);
app.use("/QandA", routerQ);
app.use("/post", routerPost);
app.use("/market",routerMarket);
app.use("/users", userRoutes);
app.use("/lands", landRoutes);

// Serve uploaded files (for profile pictures)
app.use("/uploads", express.static("uploads"));

// Test route
app.get('/api/test', (req, res) => {
  console.log('App.js: Received request to /api/test');
  res.json({ message: 'Server is running' });
});

// Handle unmatched routes
app.use((req, res) => {
  console.log(`App.js: Unmatched route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1); // Exit on failure
  });