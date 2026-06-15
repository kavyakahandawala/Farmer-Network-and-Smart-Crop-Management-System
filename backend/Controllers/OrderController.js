const Order = require("../Model/OrderModel");
const Product = require("../Model/ProductModel");
const Payment = require("../Model/PaymentModel");

// Create order
const createOrder = async (req, res) => {
  const { items, paymentDetails } = req.body;
  try {
    const payment = new Payment(paymentDetails);
    await payment.save();
    const total = await items.reduce(async (sumPromise, item) => {
      const sum = await sumPromise;
      const product = await Product.findById(item.productId);
      return sum + product.price * item.quantity;
    }, Promise.resolve(0));
    const order = new Order({
      userId: req.user.id,
      items,
      total,
      paymentId: payment._id,
    });
    await order.save();
    res.status(201).json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to create order" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId').populate('paymentId');
    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findById(id).populate('items.productId').populate('paymentId');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching order" });
  }
};

// Update order
const updateOrder = async (req, res) => {
  const id = req.params.id;
  const { paymentStatus } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to update order" });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  const id = req.params.id;
  try {
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to delete order" });
  }
};

exports.createOrder = createOrder;
exports.getAllOrders = getAllOrders;
exports.getOrderById = getOrderById;
exports.updateOrder = updateOrder;
exports.deleteOrder = deleteOrder;