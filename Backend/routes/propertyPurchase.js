const express = require('express');
const router = express.Router();
const propertyPurchaseController = require('../controllers/propertyPurchase');
const purchaseHistoryController = require('../controllers/purchaseHistory');
const isAuth = require('../middleware/is-auth');

// Property purchase routes
router.get('/property/buy/:propertyId', isAuth, propertyPurchaseController.getPropertyPurchase);
router.post('/property/buy/:propertyId', isAuth, propertyPurchaseController.postPropertyPurchase);
router.get('/property/purchase/success', isAuth, propertyPurchaseController.getSuccess);
router.get('/property/purchase/cancel', isAuth, propertyPurchaseController.getCancel);
router.get('/purchase-history', isAuth, purchaseHistoryController.getPurchaseHistory);

module.exports = router;