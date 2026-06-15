const mongoose =require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    
    productname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
  },

    category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['seeds', 'fertilizers', 'tools', 'other'],
    trim: true,
  },

     quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },

     price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },

    description: {
    type: String,
    trim: true,
    default: '',
  },

  image: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model(
    "ProductModel", //file name
    ProductSchema //function schema
)