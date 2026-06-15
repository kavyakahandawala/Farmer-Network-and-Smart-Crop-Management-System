const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const paymentController = require('../Controllers/PaymentController');

const uploadDir = 'Uploads/';
if (!fs.existsSync(uploadDir)) {
  console.log('Creating Uploads directory');
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer: Saving file to', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Multer: Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      console.log('Multer: File accepted:', file.originalname, file.mimetype);
      return cb(null, true);
    }
    console.log('Multer: File rejected:', file.originalname, file.mimetype);
    cb(new Error('Only images (jpeg, jpg, png) are allowed'));
  }
});

router.post('/', (req, res, next) => {
  upload.single('paymentSlip')(req, res, (err) => {
    if (err) {
      console.log('Multer: Upload error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    console.log('Multer: File processed:', req.file ? req.file : 'No file');
    next();
  });
}, paymentController.createPayment);

router.put('/:id', (req, res, next) => {
  upload.single('paymentSlip')(req, res, (err) => {
    if (err) {
      console.log('Multer: Upload error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    console.log('Multer: File processed:', req.file ? req.file : 'No file');
    next();
  });
}, paymentController.updatePayment);

router.get('/', paymentController.getAllPayments);
router.get('/:id', paymentController.getPaymentById);
router.get('/invoice/:id', paymentController.generateInvoice);
router.post('/verify/:id', paymentController.verifyPayment);
router.post('/unverify/:id', paymentController.unverifyPayment);
router.post('/dispatch/:id', paymentController.dispatchOrder);
router.get('/notifications/:userId', paymentController.getNotifications);
router.post('/finalize', paymentController.finalizePayment);

// Serve PDF files
router.get('/invoices/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../invoices', filename);
  console.log('PaymentRoutes: Serving invoice file:', filePath);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('PaymentRoutes: Error serving invoice:', err.message);
        res.status(500).json({ message: 'Error serving invoice' });
      }
    });
  } else {
    console.log('PaymentRoutes: Invoice file not found:', filePath);
    res.status(404).json({ message: 'Invoice file not found' });
  }
});

module.exports = router;