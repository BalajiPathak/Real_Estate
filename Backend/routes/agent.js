const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agent');
const { check } = require('express-validator');

// Remove /agent prefix since it's already added in app.js
router.get('/login', agentController.getAgentLogin);
router.post('/login', [
    check('Email').isEmail().withMessage('Please enter a valid email address'),
    check('Password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
], agentController.postAgentLogin);

router.get('/signup', agentController.getAgentSignup);
router.post('/signup', [
    check('First_Name').notEmpty().withMessage('First name is required'),
    check('Last_Name').notEmpty().withMessage('Last name is required'),
    check('Email').isEmail().withMessage('Please enter a valid email address'),
    check('Password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
], agentController.postAgentSignup);

module.exports = router;