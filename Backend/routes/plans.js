const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans');
const isAuth = require('../middleware/is-auth');

router.get('/plans', isAuth,plansController.getPlans);
router.get('/plans/purchase/:id', isAuth, plansController.getPurchaseForm);
router.post('/plans/purchase/:id', isAuth, plansController.purchasePlan);
router.get('/plans/purchase/success/:id', isAuth, plansController.purchaseSuccess);
module.exports = router;