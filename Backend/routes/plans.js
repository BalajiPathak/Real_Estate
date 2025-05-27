const express = require('express');
const router = express.Router();
const plansController = require('../controllers/plans');
const isAuth = require('../middleware/is-auth');

// Remove the '/plans' prefix from routes since it's already handled by the app.use(planRoutes)
router.get('/plans', isAuth, plansController.getPlans);
router.get('/plans/purchase/:id', isAuth, plansController.getPurchaseForm);
router.post('/plans/purchase/:id', isAuth, plansController.purchasePlan);
router.post('/plans/purchase/success/:id', isAuth, plansController.activateFreePlan);
module.exports = router;