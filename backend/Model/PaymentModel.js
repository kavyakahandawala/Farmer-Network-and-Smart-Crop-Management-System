const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  billingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing', required: true },
  orderId: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  cardDetails: {
    cardHolder: String,
    cardNumber: String,
    expMonth: Number,
    expYear: Number,
    cvv: Number
  },
  paymentSlip: String,
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  isDispatched: { type: Boolean, default: false },
  orderItems: [{ productId: String, quantity: Number, productname: String, price: Number }]
});

module.exports = mongoose.model('Payment', paymentSchema);