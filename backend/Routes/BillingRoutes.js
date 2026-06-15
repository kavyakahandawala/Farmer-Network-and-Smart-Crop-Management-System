const express = require('express');
     const router = express.Router();
     console.log('BillingRoutes: Importing BillingController');
     const BillingController = require('../Controllers/BillingController');

     router.post('/', BillingController.createBilling);
     router.get('/', BillingController.getAllBilling);
     router.get('/:id', BillingController.getBillingById);
     router.put('/:id', BillingController.updateBilling);
     router.delete('/:id', BillingController.deleteBilling);

     module.exports = router;