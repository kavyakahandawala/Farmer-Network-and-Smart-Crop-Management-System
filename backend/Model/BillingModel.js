const mongoose = require("mongoose");
     const Schema = mongoose.Schema;

     const BillingSchema = new Schema({
       userId: { type: String, required: true },
       firstName: {
         type: String,
         required: [true, 'First name is required'],
         trim: true,
         minlength: [2, 'First name must be at least 2 characters'],
       },
       lastName: {
         type: String,
         required: [true, 'Last name is required'],
         trim: true,
         minlength: [2, 'Last name must be at least 2 characters'],
       },
       email: {
         type: String,
         required: [true, 'Email is required'],
         trim: true,
         match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
       },
       contactNumber: {
         type: String,
         required: [true, 'Contact number is required'],
         trim: true,
         match: [/^\d{10}$/, 'Contact number must be 10 digits'],
       },
       country: {
         type: String,
         required: [true, 'Country is required'],
         trim: true,
       },
       street: {
         type: String,
         required: [true, 'Street is required'],
         trim: true,
       },
       city: {
         type: String,
         required: [true, 'City is required'],
         trim: true,
       },
       createdAt: { type: Date, default: Date.now },
     });

     module.exports = mongoose.model("BillingModel", BillingSchema);