const express = require('express');
const router = express.Router();
const navController = require('../controllers/navbar');
const { check } = require('express-validator');

router.post('/navbar', navController.createNavbar);

router.get('/navbars', navController.getAllNavbars);
router.get('/contact', navController.getContact);
router.post(
    '/contact',
    [
        check('firstname')
            .trim()
            .notEmpty()
            .withMessage('First name is required'),
        check('lastname')
            .trim()
            .notEmpty()
            .withMessage('Last name is required'),
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email'),
        check('subject')
            .trim()
            .notEmpty()
            .withMessage('Subject is required'),
        check('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters long')
    ],
    navController.postContact
);

module.exports = router;
