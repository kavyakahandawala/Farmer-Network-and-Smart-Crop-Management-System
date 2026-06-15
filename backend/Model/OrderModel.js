const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: { type: String, required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'ProductModel', required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
  ],
  total: { type: Number, required: true, min: 0 },
  paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: false },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);