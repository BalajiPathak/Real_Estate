const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const purchaseHistoryController = require('../controllers/purchaseHistory');

router.get('/purchase-history', isAuth, purchaseHistoryController.getPurchaseHistory);

module.exports = router;