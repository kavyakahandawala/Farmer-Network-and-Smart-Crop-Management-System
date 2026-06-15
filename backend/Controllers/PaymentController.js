const mongoose = require('mongoose');
const Payment = require('../Model/PaymentModel');
const BillingModel = require('../Model/BillingModel');
const Notification = require('../Model/NotificationModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { sendEmail } = require('../services/emailService');

exports.createPayment = async (req, res) => {
  try {
    console.log('PaymentController: Request headers:', req.headers);
    console.log('PaymentController: Request body:', req.body);
    console.log('PaymentController: Uploaded file:', req.file ? {
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype
    } : 'No file uploaded');

    const { billingId, orderId, paymentMethod, totalAmount, cardHolder, cardNumber, expMonth, expYear, cvv, orderItems } = req.body;

    const missingFields = [];
    if (!billingId) missingFields.push('billingId');
    if (!orderId) missingFields.push('orderId');
    if (!paymentMethod) missingFields.push('paymentMethod');
    if (!totalAmount) missingFields.push('totalAmount');
    if (paymentMethod === 'card') {
      if (!cardHolder) missingFields.push('cardHolder');
      if (!cardNumber) missingFields.push('cardNumber');
      if (!expMonth) missingFields.push('expMonth');
      if (!expYear) missingFields.push('expYear');
      if (!cvv) missingFields.push('cvv');
    }
    if (missingFields.length > 0) {
      console.log('PaymentController: Missing fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!mongoose.Types.ObjectId.isValid(billingId)) {
      console.log('PaymentController: Invalid billingId format:', billingId);
      return res.status(400).json({ message: 'Invalid billing ID format' });
    }

    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
      console.log('PaymentController: Invalid totalAmount:', totalAmount);
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    const billing = await BillingModel.findById(billingId);
    if (!billing) {
      console.log('PaymentController: Billing not found for ID:', billingId);
      return res.status(404).json({ message: 'Billing info not found' });
    }

    if (paymentMethod === 'slip' && !req.file) {
      console.log('PaymentController: No payment slip uploaded for slip method');
      return res.status(400).json({ message: 'Payment slip required for slip payment method' });
    }

    if (paymentMethod === 'card') {
      if (!/^\d{16}$/.test(cardNumber)) {
        console.log('PaymentController: Invalid cardNumber:', cardNumber);
        return res.status(400).json({ message: 'Card number must be 16 digits' });
      }
      const parsedExpMonth = parseInt(expMonth || '0');
      const parsedExpYear = parseInt(expYear || '0');
      const parsedCvv = parseInt(cvv || '0');
      if (isNaN(parsedExpMonth) || parsedExpMonth < 1 || parsedExpMonth > 12) {
        console.log('PaymentController: Invalid expMonth:', expMonth);
        return res.status(400).json({ message: 'Expiry month must be between 1 and 12' });
      }
      if (isNaN(parsedExpYear) || parsedExpYear < new Date().getFullYear() || parsedExpYear > new Date().getFullYear() + 10) {
        console.log('PaymentController: Invalid expYear:', expYear);
        return res.status(400).json({ message: 'Expiry year must be between current year and 10 years in the future' });
      }
      if (isNaN(parsedCvv) || parsedCvv < 100 || parsedCvv > 999) {
        console.log('PaymentController: Invalid cvv:', cvv);
        return res.status(400).json({ message: 'CVV must be 3 digits' });
      }
    }

    const payment = new Payment({
      userId: req.user?.id || 'guest_user',
      billingId,
      orderId,
      paymentMethod,
      paymentSlip: req.file ? `/Uploads/${req.file.filename}` : undefined,
      totalAmount: parsedTotalAmount,
      status: paymentMethod === 'slip' ? 'pending' : 'completed',
      orderItems: orderItems ? JSON.parse(orderItems) : [],
      cardDetails: paymentMethod === 'card' ? {
        cardHolder,
        cardNumber,
        expMonth: parseInt(expMonth),
        expYear: parseInt(expYear),
        cvv: parseInt(cvv)
      } : undefined
    });

    const savedPayment = await payment.save();
    console.log('PaymentController: Saved to payments:', savedPayment);

    if (paymentMethod === 'slip') {
      const notification = new Notification({
        userId: req.user?.id || 'guest_user',
        message: 'Payment slip uploaded, pending verification.'
      });
      await notification.save();
      console.log('PaymentController: Notification saved for slip payment');
    } else if (paymentMethod === 'card') {
      const notification = new Notification({
        userId: req.user?.id || 'guest_user',
        message: 'Card payment processed successfully.'
      });
      await notification.save();
      console.log('PaymentController: Notification saved for card payment');
    }

    res.status(201).json({
      payment: savedPayment,
      paymentId: savedPayment._id,
      message: paymentMethod === 'slip' ? 'The admin will verify your payment' : 'Payment successful'
    });
  } catch (error) {
    console.error('PaymentController: Error creating payment:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating payment', error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Fetching payment with ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id).populate({
      path: 'billingId',
      model: 'BillingModel',
      select: 'firstName lastName email contactNumber country street city'
    }).lean();
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Mask card number
    if (payment.cardDetails && payment.cardDetails.cardNumber) {
      payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
    }

    console.log('PaymentController: Payment found:', payment);
    res.status(200).json({ payment });
  } catch (error) {
    console.error('PaymentController: Error fetching payment:', error.message, error.stack);
    if (error.name === 'MissingSchemaError') {
      console.log('PaymentController: Billing model not registered, returning payment without populated billingId');
      const payment = await Payment.findById(id).lean();
      if (!payment) {
        console.log('PaymentController: Payment not found for ID:', id);
        return res.status(404).json({ message: 'Payment not found' });
      }
      // Mask card number
      if (payment.cardDetails && payment.cardDetails.cardNumber) {
        payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
      }
      return res.status(200).json({ payment });
    }
    res.status(500).json({ message: 'Error fetching payment', error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    console.log('PaymentController: Fetching all payments');
    const payments = await Payment.find().populate({
      path: 'billingId',
      model: 'BillingModel',
      select: 'firstName lastName email contactNumber country street city'
    }).lean();
    if (!payments || payments.length === 0) {
      console.log('PaymentController: No payments found');
      return res.status(404).json({ message: 'No payments found' });
    }
    // Mask card numbers
    const maskedPayments = payments.map(payment => {
      if (payment.cardDetails && payment.cardDetails.cardNumber) {
        payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
      }
      return payment;
    });
    console.log('PaymentController: Fetched payments:', maskedPayments);
    res.status(200).json({ payments: maskedPayments });
  } catch (error) {
    console.error('PaymentController: Error fetching payments:', error.message, error.stack);
    if (error.name === 'MissingSchemaError') {
      console.log('PaymentController: Billing model not registered, returning payments without populated billingId');
      const payments = await Payment.find().lean();
      if (!payments || payments.length === 0) {
        console.log('PaymentController: No payments found');
        return res.status(404).json({ message: 'No payments found' });
      }
      // Mask card numbers
      const maskedPayments = payments.map(payment => {
        if (payment.cardDetails && payment.cardDetails.cardNumber) {
          payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
        }
        return payment;
      });
      return res.status(200).json({ payments: maskedPayments });
    }
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Updating payment with ID:', id, 'Body:', req.body);
    const { billingId, orderId, paymentMethod, totalAmount, cardHolder, cardNumber, expMonth, expYear, cvv, orderItems } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    const missingFields = [];
    if (billingId && !mongoose.Types.ObjectId.isValid(billingId)) {
      console.log('PaymentController: Invalid billingId format:', billingId);
      return res.status(400).json({ message: 'Invalid billing ID format' });
    }
    if (billingId) {
      const billing = await BillingModel.findById(billingId);
      if (!billing) {
        console.log('PaymentController: Billing not found for ID:', billingId);
        return res.status(404).json({ message: 'Billing info not found' });
      }
      payment.billingId = billingId;
    }
    if (totalAmount) {
      const parsedTotalAmount = parseFloat(totalAmount);
      if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
        console.log('PaymentController: Invalid totalAmount:', totalAmount);
        return res.status(400).json({ message: 'Invalid total amount' });
      }
      payment.totalAmount = parsedTotalAmount;
    }
    if (paymentMethod === 'slip' && !req.file) {
      console.log('PaymentController: No payment slip uploaded for slip method');
      return res.status(400).json({ message: 'Payment slip required for slip payment method' });
    }
    if (paymentMethod === 'card') {
      if (!cardHolder || !cardNumber || !expMonth || !expYear || !cvv) {
        missingFields.push(...[!cardHolder ? 'cardHolder' : '', !cardNumber ? 'cardNumber' : '', !expMonth ? 'expMonth' : '', !expYear ? 'expYear' : '', !cvv ? 'cvv' : ''].filter(Boolean));
      }
      if (missingFields.length > 0) {
        console.log('PaymentController: Missing fields:', missingFields);
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
      }
      if (!/^\d{16}$/.test(cardNumber)) {
        console.log('PaymentController: Invalid cardNumber:', cardNumber);
        return res.status(400).json({ message: 'Card number must be 16 digits' });
      }
      const parsedExpMonth = parseInt(expMonth || '0');
      const parsedExpYear = parseInt(expYear || '0');
      const parsedCvv = parseInt(cvv || '0');
      if (isNaN(parsedExpMonth) || parsedExpMonth < 1 || parsedExpMonth > 12) {
        console.log('PaymentController: Invalid expMonth:', expMonth);
        return res.status(400).json({ message: 'Expiry month must be between 1 and 12' });
      }
      if (isNaN(parsedExpYear) || parsedExpYear < new Date().getFullYear() || parsedExpYear > new Date().getFullYear() + 10) {
        console.log('PaymentController: Invalid expYear:', expYear);
        return res.status(400).json({ message: 'Expiry year must be between current year and 10 years in the future' });
      }
      if (isNaN(parsedCvv) || parsedCvv < 100 || parsedCvv > 999) {
        console.log('PaymentController: Invalid cvv:', cvv);
        return res.status(400).json({ message: 'CVV must be 3 digits' });
      }
      payment.cardDetails = {
        cardHolder,
        cardNumber,
        expMonth: parsedExpMonth,
        expYear: parsedExpYear,
        cvv: parsedCvv
      };
    }

    if (orderId) payment.orderId = orderId;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (req.file) payment.paymentSlip = `/Uploads/${req.file.filename}`;
    if (paymentMethod) payment.status = paymentMethod === 'slip' ? 'pending' : 'completed';
    if (orderItems) payment.orderItems = JSON.parse(orderItems);

    const updatedPayment = await payment.save();
    console.log('PaymentController: Updated payment:', updatedPayment);

    if (paymentMethod === 'slip') {
      const notification = new Notification({
        userId: req.user?.id || 'guest_user',
        message: 'Payment slip updated, pending verification.'
      });
      await notification.save();
      console.log('PaymentController: Notification saved for slip payment update');
    } else if (paymentMethod === 'card') {
      const notification = new Notification({
        userId: req.user?.id || 'guest_user',
        message: 'Card payment updated successfully.'
      });
      await notification.save();
      console.log('PaymentController: Notification saved for card payment update');
    }

    res.status(200).json({
      payment: updatedPayment,
      paymentId: updatedPayment._id,
      message: paymentMethod === 'slip' ? 'Payment updated, pending verification' : 'Payment updated successfully'
    });
  } catch (error) {
    console.error('PaymentController: Error updating payment:', error.message, error.stack);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Verifying payment with ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id).populate({
      path: 'billingId',
      model: 'BillingModel',
      select: 'firstName lastName email contactNumber country street city'
    });
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentMethod !== 'slip') {
      console.log('PaymentController: Only slip payments can be verified:', id);
      return res.status(400).json({ message: 'Only slip payments can be verified' });
    }

    payment.status = 'completed';
    const updatedPayment = await payment.save();
    console.log('PaymentController: Payment verified:', updatedPayment);

    // Generate invoice
    const invoiceDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoiceDir)) {
      console.log('PaymentController: Creating invoices directory');
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(invoiceDir, `invoice_${id}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    const green = [46, 125, 50];
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Header
    doc.font('Helvetica-Bold').fontSize(18).fillColor(green);
    doc.text('AgroSphere', 30, 30, { align: 'left' });
    doc.font('Helvetica').fontSize(10).fillColor('black');
    doc.text('agrosphere@gmail.com', 30, 50);
    doc.text('AgroSphere, Colombo Rd, Kurunegala', 30, 65);
    doc.font('Helvetica-Oblique').text(`Date: ${formattedDate}`, 30, 80);
    doc.moveTo(30, 95).lineTo(565, 95).lineWidth(1).strokeColor(green).stroke();

    // Title
    doc.font('Helvetica-Bold').fontSize(14).fillColor('black');
    doc.text(`Invoice #${id}`, 0, 110, { align: 'center' });

    // Billing Information Section
    doc.font('Helvetica-Bold').fontSize(12).text('Billing Information', 30, 140);
    let y = 155;
    const columnWidths = [120, 350];
    const cellPadding = 6;
    const rowHeight = 12;

    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
    doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
    doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

    const billingData = payment.billingId
      ? [
          ['Name', `${payment.billingId.firstName} ${payment.billingId.lastName}`],
          ['Email', payment.billingId.email],
          ['Contact', payment.billingId.contactNumber],
          ['Address', `${payment.billingId.street}, ${payment.billingId.city}, ${payment.billingId.country}`],
        ]
      : [['Billing', 'Not available']];

    doc.font('Helvetica').fillColor('black');
    billingData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
    });

    // Order Details Section
    y += rowHeight + 20;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
    doc.text('Order Details', 30, y);
    y += 15;

    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
    doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
    doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

    const orderData = [
      ['Order ID', payment.orderId],
      ['Payment Method', payment.paymentMethod],
      ['Total Amount', `Rs ${payment.totalAmount.toFixed(2)}`],
      ['Status', payment.status.charAt(0).toUpperCase() + payment.status.slice(1)],
    ];

    doc.font('Helvetica').fillColor('black');
    orderData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
    });

    // Items Table
    y += rowHeight + 20;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
    doc.text('Order Items', 30, y);
    y += 15;

    const itemColumnWidths = [200, 60, 90, 90];
    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, itemColumnWidths[0], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fill(green);
    doc.text('Product', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Quantity', 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { align: 'center' });
    doc.text('Unit Price', 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { align: 'right' });
    doc.text('Total', 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { align: 'right' });

    const itemsData = payment.orderItems.map(item => [
      item.productname,
      item.quantity.toString(),
      `Rs ${item.price.toFixed(2)}`,
      `Rs ${(item.price * item.quantity).toFixed(2)}`,
    ]);

    doc.font('Helvetica').fillColor('black');
    itemsData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, itemColumnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[1] - cellPadding * 2, align: 'center' });
      doc.text(row[2], 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[2] - cellPadding * 2, align: 'right' });
      doc.text(row[3], 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[3] - cellPadding * 2, align: 'right' });
    });

    // Total Amount
    y += rowHeight + 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
    doc.text(`Total Amount: Rs ${payment.totalAmount.toFixed(2)}`, 30, y, { align: 'right', width: 500 });

    // Footer
    doc.font('Helvetica').fontSize(9).fillColor('gray');
    doc.text('Thank you for your business!', 0, 750, { align: 'center' });
    doc.text(`Page ${doc.page.number + 1}`, 0, 770, { align: 'center' });

    doc.end();
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log('PaymentController: Generated invoice at:', invoicePath);

    // Send email with invoice
    const emailOptions = {
      to: payment.billingId?.email || 'default@example.com',
      subject: 'Payment Verification and Invoice',
      text: `Dear ${payment.billingId?.firstName || 'Customer'},\n\nYour payment slip for order ${payment.orderId} has been verified. Please find the invoice attached for your records.\n\nThank you for shopping with AgroSphere!`,
      attachments: [
        {
          filename: `invoice_${id}.pdf`,
          path: invoicePath
        }
      ]
    };
    await sendEmail(emailOptions);
    console.log('PaymentController: Verification email sent to:', payment.billingId?.email);

    const notification = new Notification({
      userId: payment.userId,
      message: 'Your payment slip has been verified. Check your email for the invoice.'
    });
    await notification.save();
    console.log('PaymentController: Notification saved for payment verification');

    res.status(200).json({
      payment: updatedPayment,
      invoice: `/invoices/invoice_${id}.pdf`,
      message: 'Payment verified successfully, invoice sent to user'
    });
  } catch (error) {
    console.error('PaymentController: Error verifying payment:', error.message, error.stack);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

exports.unverifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Unverifying payment with ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentMethod !== 'slip') {
      console.log('PaymentController: Only slip payments can be unverified:', id);
      return res.status(400).json({ message: 'Only slip payments can be unverified' });
    }

    payment.status = 'pending';
    const updatedPayment = await payment.save();
    console.log('PaymentController: Payment unverified:', updatedPayment);

    const notification = new Notification({
      userId: payment.userId,
      message: 'Your payment slip verification has been reverted.'
    });
    await notification.save();
    console.log('PaymentController: Notification saved for payment unverification');

    res.status(200).json({
      payment: updatedPayment,
      message: 'Payment unverified successfully'
    });
  } catch (error) {
    console.error('PaymentController: Error unverifying payment:', error.message, error.stack);
    res.status(500).json({ message: 'Error unverifying payment', error: error.message });
  }
};

exports.dispatchOrder = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Dispatching order with ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      console.log('PaymentController: Cannot dispatch order with status:', payment.status);
      return res.status(400).json({ message: 'Order must be completed to dispatch' });
    }

    payment.status = 'dispatched';
    const updatedPayment = await payment.save();
    console.log('PaymentController: Order dispatched:', updatedPayment);

    const notification = new Notification({
      userId: payment.userId,
      message: 'Your order has been dispatched.'
    });
    await notification.save();
    console.log('PaymentController: Notification saved for order dispatch');

    res.status(200).json({
      payment: updatedPayment,
      message: 'Order dispatched successfully'
    });
  } catch (error) {
    console.error('PaymentController: Error dispatching order:', error.message, error.stack);
    res.status(500).json({ message: 'Error dispatching order', error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('PaymentController: Fetching notifications for userId:', userId);
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).lean();
    if (!notifications || notifications.length === 0) {
      console.log('PaymentController: No notifications found for userId:', userId);
      return res.status(404).json({ message: 'No notifications found' });
    }
    console.log('PaymentController: Fetched notifications:', notifications);
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('PaymentController: Error fetching notifications:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

exports.finalizePayment = async (req, res) => {
  try {
    const { billingId, orderId, paymentMethod, orderItems, totalAmount, paymentId } = req.body;

    console.log('PaymentController: Finalizing payment with:', { billingId, orderId, paymentMethod, paymentId, totalAmount });

    // Validate inputs
    const missingFields = [];
    if (!billingId) missingFields.push('billingId');
    if (!orderId) missingFields.push('orderId');
    if (!paymentMethod) missingFields.push('paymentMethod');
    if (!orderItems) missingFields.push('orderItems');
    if (!totalAmount) missingFields.push('totalAmount');
    if (!paymentId) missingFields.push('paymentId');
    if (missingFields.length > 0) {
      console.log('PaymentController: Missing fields:', missingFields);
      return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(billingId) || !mongoose.Types.ObjectId.isValid(paymentId)) {
      console.log('PaymentController: Invalid ID format:', { billingId, paymentId });
      return res.status(400).json({ message: 'Invalid billingId or paymentId format' });
    }

    // Parse orderItems
    let parsedOrderItems;
    try {
      parsedOrderItems = JSON.parse(orderItems);
    } catch (error) {
      console.log('PaymentController: Invalid orderItems format:', orderItems);
      return res.status(400).json({ message: 'Invalid orderItems format' });
    }

    // Validate totalAmount
    const parsedTotalAmount = parseFloat(totalAmount);
    if (isNaN(parsedTotalAmount) || parsedTotalAmount <= 0) {
      console.log('PaymentController: Invalid totalAmount:', totalAmount);
      return res.status(400).json({ message: 'Invalid total amount' });
    }

    // Verify billingId exists
    const billing = await BillingModel.findById(billingId);
    if (!billing) {
      console.log('PaymentController: Billing not found for ID:', billingId);
      return res.status(404).json({ message: 'Billing info not found' });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', paymentId);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Verify payment matches orderId, billingId, and paymentMethod
    if (payment.orderId !== orderId || payment.billingId.toString() !== billingId || payment.paymentMethod !== 'card') {
      console.log('PaymentController: Payment mismatch:', {
        paymentOrderId: payment.orderId,
        orderId,
        paymentBillingId: payment.billingId.toString(),
        billingId,
        paymentMethod: payment.paymentMethod
      });
      return res.status(400).json({ message: 'Payment does not match order, billing, or method' });
    }

    // Check if payment is already completed
    if (payment.status === 'completed') {
      console.log('PaymentController: Payment already completed:', paymentId);
      return res.status(400).json({ message: 'Payment is already completed' });
    }

    // Update payment
    payment.status = 'completed';
    payment.orderItems = parsedOrderItems;
    payment.totalAmount = parsedTotalAmount;
    const updatedPayment = await payment.save();

    console.log('PaymentController: Payment finalized:', updatedPayment);

    // Create notification
    const notification = new Notification({
      userId: payment.userId || 'guest_user',
      message: 'Card payment finalized successfully.'
    });
    await notification.save();
    console.log('PaymentController: Notification saved for payment finalization');

    res.status(200).json({
      payment: updatedPayment,
      paymentId: updatedPayment._id,
      message: 'Payment finalized successfully'
    });
  } catch (error) {
    console.error('PaymentController: Error finalizing payment:', error.message, error.stack);
    res.status(500).json({ message: 'Error finalizing payment', error: error.message });
  }
};

exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PaymentController: Generating invoice for payment ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('PaymentController: Invalid payment ID format:', id);
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(id).populate({
      path: 'billingId',
      model: 'BillingModel',
      select: 'firstName lastName email contactNumber country street city'
    }).lean();
    if (!payment) {
      console.log('PaymentController: Payment not found for ID:', id);
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Mask card number
    if (payment.cardDetails && payment.cardDetails.cardNumber) {
      payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
    }

    const invoiceDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoiceDir)) {
      console.log('PaymentController: Creating invoices directory');
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const invoicePath = path.join(invoiceDir, `invoice_${id}.pdf`);
    const doc = new PDFDocument({ size: 'A4', margin: 30 });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    const green = [46, 125, 50];
    const now = new Date();
    const formattedDate = now.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Header
    doc.font('Helvetica-Bold').fontSize(18).fillColor(green);
    doc.text('AgroSphere', 30, 30, { align: 'left' });
    doc.font('Helvetica').fontSize(10).fillColor('black');
    doc.text('agrosphere@gmail.com', 30, 50);
    doc.text('AgroSphere, Colombo Rd, Kurunegala', 30, 65);
    doc.font('Helvetica-Oblique').text(`Date: ${formattedDate}`, 30, 80);
    doc.moveTo(30, 95).lineTo(565, 95).lineWidth(1).strokeColor(green).stroke();

    // Title
    doc.font('Helvetica-Bold').fontSize(14).fillColor('black');
    doc.text(`Invoice #${id}`, 0, 110, { align: 'center' });

    // Billing Information Section
    doc.font('Helvetica-Bold').fontSize(12).text('Billing Information', 30, 140);
    let y = 155;
    const columnWidths = [120, 350];
    const cellPadding = 6;
    const rowHeight = 12;

    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
    doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
    doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

    const billingData = payment.billingId
      ? [
          ['Name', `${payment.billingId.firstName} ${payment.billingId.lastName}`],
          ['Email', payment.billingId.email],
          ['Contact', payment.billingId.contactNumber],
          ['Address', `${payment.billingId.street}, ${payment.billingId.city}, ${payment.billingId.country}`],
        ]
      : [['Billing', 'Not available']];

    doc.font('Helvetica').fillColor('black');
    billingData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
    });

    // Order Details Section
    y += rowHeight + 20;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
    doc.text('Order Details', 30, y);
    y += 15;

    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
    doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
    doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

    const orderData = [
      ['Order ID', payment.orderId],
      ['Payment Method', payment.paymentMethod],
      ['Total Amount', `Rs ${payment.totalAmount.toFixed(2)}`],
      ['Status', payment.status.charAt(0).toUpperCase() + payment.status.slice(1)],
    ];

    doc.font('Helvetica').fillColor('black');
    orderData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
    });

    // Items Table
    y += rowHeight + 20;
    doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
    doc.text('Order Items', 30, y);
    y += 15;

    const itemColumnWidths = [200, 60, 90, 90];
    doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
    doc.rect(30, y, itemColumnWidths[0], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fill(green);
    doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fill(green);
    doc.text('Product', 30 + cellPadding, y + cellPadding / 2);
    doc.text('Quantity', 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { align: 'center' });
    doc.text('Unit Price', 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { align: 'right' });
    doc.text('Total', 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { align: 'right' });

    const itemsData = payment.orderItems.map(item => [
      item.productname,
      item.quantity.toString(),
      `Rs ${item.price.toFixed(2)}`,
      `Rs ${(item.price * item.quantity).toFixed(2)}`,
    ]);

    doc.font('Helvetica').fillColor('black');
    itemsData.forEach((row, index) => {
      y += rowHeight;
      if (index % 2 === 0) {
        doc.rect(30, y, itemColumnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
      }
      doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[0] - cellPadding * 2, align: 'left' });
      doc.text(row[1], 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[1] - cellPadding * 2, align: 'center' });
      doc.text(row[2], 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[2] - cellPadding * 2, align: 'right' });
      doc.text(row[3], 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[3] - cellPadding * 2, align: 'right' });
    });

    // Total Amount
    y += rowHeight + 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
    doc.text(`Total Amount: Rs ${payment.totalAmount.toFixed(2)}`, 30, y, { align: 'right', width: 500 });

    // Footer
    doc.font('Helvetica').fontSize(9).fillColor('gray');
    doc.text('Thank you for your business!', 0, 750, { align: 'center' });
    doc.text(`Page ${doc.page.number + 1}`, 0, 770, { align: 'center' });

    doc.end();
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    console.log('PaymentController: Generated invoice at:', invoicePath);
    res.status(200).json({ invoice: `/invoices/invoice_${id}.pdf` });
  } catch (error) {
    console.error('PaymentController: Error generating invoice:', error.message, error.stack);
    if (error.name === 'MissingSchemaError') {
      console.log('PaymentController: Billing model not registered, returning payment without populated billingId');
      const payment = await Payment.findById(id).lean();
      if (!payment) {
        console.log('PaymentController: Payment not found for ID:', id);
        return res.status(404).json({ message: 'Payment not found' });
      }
      // Mask card number
      if (payment.cardDetails && payment.cardDetails.cardNumber) {
        payment.cardDetails.cardNumber = payment.cardDetails.cardNumber.slice(-4).padStart(16, '*');
      }
      const invoicePath = path.join(__dirname, '../invoices', `invoice_${id}.pdf`);
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      const green = [46, 125, 50];
      const now = new Date();
      const formattedDate = now.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      // Header
      doc.font('Helvetica-Bold').fontSize(18).fillColor(green);
      doc.text('AgroSphere', 30, 30, { align: 'left' });
      doc.font('Helvetica').fontSize(10).fillColor('black');
      doc.text('agrosphere@gmail.com', 30, 50);
      doc.text('AgroSphere, Colombo Rd, Kurunegala', 30, 65);
      doc.font('Helvetica-Oblique').text(`Date: ${formattedDate}`, 30, 80);
      doc.moveTo(30, 95).lineTo(565, 95).lineWidth(1).strokeColor(green).stroke();

      // Title
      doc.font('Helvetica-Bold').fontSize(14).fillColor('black');
      doc.text(`Invoice #${id}`, 0, 110, { align: 'center' });

      // Billing Information Section
      doc.font('Helvetica-Bold').fontSize(12).text('Billing Information', 30, 140);
      let y = 155;
      const columnWidths = [120, 350];
      const cellPadding = 6;
      const rowHeight = 12;

      doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
      doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
      doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
      doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
      doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

      const billingData = [['Billing', 'Not available']];

      doc.font('Helvetica').fillColor('black');
      billingData.forEach((row, index) => {
        y += rowHeight;
        if (index % 2 === 0) {
          doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
          doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        }
        doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
        doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
      });

      // Order Details Section
      y += rowHeight + 20;
      doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
      y += 15;

      doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
      doc.rect(30, y, columnWidths[0], rowHeight).fill(green);
      doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fill(green);
      doc.text('Field', 30 + cellPadding, y + cellPadding / 2);
      doc.text('Details', 30 + columnWidths[0] + cellPadding, y + cellPadding / 2);

      const orderData = [
        ['Order ID', payment.orderId],
        ['Payment Method', payment.paymentMethod],
        ['Total Amount', `Rs ${payment.totalAmount.toFixed(2)}`],
        ['Status', payment.status.charAt(0).toUpperCase() + payment.status.slice(1)],
      ];

      doc.font('Helvetica').fillColor('black');
      orderData.forEach((row, index) => {
        y += rowHeight;
        if (index % 2 === 0) {
          doc.rect(30, y, columnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
          doc.rect(30 + columnWidths[0], y, columnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        }
        doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: columnWidths[0] - cellPadding * 2, align: 'left' });
        doc.text(row[1], 30 + columnWidths[0] + cellPadding, y + cellPadding / 2, { width: columnWidths[1] - cellPadding * 2, align: 'left' });
      });

      // Items Table
      y += rowHeight + 20;
      doc.font('Helvetica-Bold').fontSize(12).fillColor('black');
      doc.text('Order Items', 30, y);
      y += 15;

      const itemColumnWidths = [200, 60, 90, 90];
      doc.font('Helvetica-Bold').fontSize(8).fillColor('white');
      doc.rect(30, y, itemColumnWidths[0], rowHeight).fill(green);
      doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fill(green);
      doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fill(green);
      doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fill(green);
      doc.text('Product', 30 + cellPadding, y + cellPadding / 2);
      doc.text('Quantity', 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { align: 'center' });
      doc.text('Unit Price', 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { align: 'right' });
      doc.text('Total', 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { align: 'right' });

      const itemsData = payment.orderItems.map(item => [
        item.productname,
        item.quantity.toString(),
        `Rs ${item.price.toFixed(2)}`,
        `Rs ${(item.price * item.quantity).toFixed(2)}`,
      ]);

      doc.font('Helvetica').fillColor('black');
      itemsData.forEach((row, index) => {
        y += rowHeight;
        if (index % 2 === 0) {
          doc.rect(30, y, itemColumnWidths[0], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
          doc.rect(30 + itemColumnWidths[0], y, itemColumnWidths[1], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
          doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1], y, itemColumnWidths[2], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
          doc.rect(30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2], y, itemColumnWidths[3], rowHeight).fillOpacity(0.05).fill('gray').fillOpacity(1);
        }
        doc.text(row[0], 30 + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[0] - cellPadding * 2, align: 'left' });
        doc.text(row[1], 30 + itemColumnWidths[0] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[1] - cellPadding * 2, align: 'center' });
        doc.text(row[2], 30 + itemColumnWidths[0] + itemColumnWidths[1] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[2] - cellPadding * 2, align: 'right' });
        doc.text(row[3], 30 + itemColumnWidths[0] + itemColumnWidths[1] + itemColumnWidths[2] + cellPadding, y + cellPadding / 2, { width: itemColumnWidths[3] - cellPadding * 2, align: 'right' });
      });

      // Total Amount
      y += rowHeight + 10;
      doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
      doc.text(`Total Amount: Rs ${payment.totalAmount.toFixed(2)}`, 30, y, { align: 'right', width: 500 });

      // Footer
      doc.font('Helvetica').fontSize(9).fillColor('gray');
      doc.text('Thank you for your business!', 0, 750, { align: 'center' });
      doc.text(`Page ${doc.page.number + 1}`, 0, 770, { align: 'center' });

      doc.end();
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      return res.status(200).json({ invoice: `/invoices/invoice_${id}.pdf` });
    }
    res.status(500).json({ message: 'Error generating invoice', error: error.message });
  }
};

module.exports = exports;