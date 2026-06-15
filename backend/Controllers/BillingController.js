const mongoose = require('mongoose');
const BillingModel = require('../Model/BillingModel'); // Use BillingModel

exports.createBilling = async (req, res) => {
  try {
    console.log('BillingController: POST /billing received:', req.body);
    const billingData = { ...req.body, userId: 'guest_user' };
    const billing = new BillingModel(billingData); // Use BillingModel
    await billing.save();
    console.log('BillingController: Billing saved:', billing);
    res.status(201).json({ message: 'Billing information saved successfully', billing });
  } catch (error) {
    console.error('BillingController: Error saving billing:', error.message, error.stack);
    res.status(500).json({ message: 'Error saving billing information', error: error.message });
  }
};

exports.getAllBilling = async (req, res) => {
  try {
    console.log('BillingController: Fetching all billing records');
    const billings = await BillingModel.find().lean(); // Use BillingModel
    if (!billings || billings.length === 0) {
      console.log('BillingController: No billing records found');
      return res.status(404).json({ message: 'No billing records found' });
    }
    console.log('BillingController: Fetched billings:', billings);
    res.json({ billings });
  } catch (error) {
    console.error('BillingController: Error fetching all billings:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching billing information', error: error.message });
  }
};

exports.getBillingById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('BillingController: Fetching billing with ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('BillingController: Invalid billing ID format:', id);
      return res.status(400).json({ message: 'Invalid billing ID format' });
    }
    const billing = await BillingModel.findById(id).lean(); // Use BillingModel
    if (!billing) {
      console.log('BillingController: Billing not found for ID:', id);
      return res.status(404).json({ message: 'Billing not found' });
    }
    console.log('BillingController: Billing found:', billing);
    res.json({ billing });
  } catch (error) {
    console.error('BillingController: Error fetching billing:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching billing information', error: error.message });
  }
};

exports.updateBilling = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('BillingController: PUT /billing/:id received, ID:', id, 'Data:', req.body);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('BillingController: Invalid billing ID format:', id);
      return res.status(400).json({ message: 'Invalid billing ID format' });
    }
    const billing = await BillingModel.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean(); // Use BillingModel
    if (!billing) {
      console.log('BillingController: Billing not found for ID:', id);
      return res.status(404).json({ message: 'Billing not found' });
    }
    console.log('BillingController: Billing updated:', billing);
    res.json({ message: 'Billing information updated successfully', billing });
  } catch (error) {
    console.error('BillingController: Error updating billing:', error.message, error.stack);
    res.status(500).json({ message: 'Error updating billing information', error: error.message });
  }
};

exports.deleteBilling = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('BillingController: DELETE /billing/:id received, ID:', id);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('BillingController: Invalid billing ID format:', id);
      return res.status(400).json({ message: 'Invalid billing ID format' });
    }
    const billing = await BillingModel.findByIdAndDelete(id).lean(); // Use BillingModel
    if (!billing) {
      console.log('BillingController: Billing not found for ID:', id);
      return res.status(404).json({ message: 'Billing not found' });
    }
    console.log('BillingController: Billing deleted:', billing);
    res.json({ message: 'Billing information deleted successfully' });
  } catch (error) {
    console.error('BillingController: Error deleting billing:', error.message, error.stack);
    res.status(500).json({ message: 'Error deleting billing information', error: error.message });
  }
};