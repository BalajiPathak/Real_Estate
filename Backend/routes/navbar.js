const express = require('express');
const router = express.Router();
const navController = require('../controllers/navbar');
const { check } = require('express-validator');
const axios = require('axios');

router.post('/navbar', navController.createNavbar);

router.get('/navbars', navController.getAllNavbars);
router.get('/contact', navController.getContact);
router.post(
    '/contact',
    [
        check('firstname').trim().notEmpty().isLength({ min:5 }).withMessage('First name must be at least 5 characters long'),
        check('lastname').trim().notEmpty().isLength({ min:5 }).withMessage('Last name must be at least 5 characters long'),
        check('email').isEmail().withMessage('Please enter a valid email'),
        check('subject').trim().notEmpty().isLength({ min:5 }).withMessage('Subject  must be at least 5 characters long'),
        check('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
            .isLength({ min: 10 })
            .withMessage('Message must be at least 10 characters long'),
        check('captchaInput')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.captchaText) {
                    throw new Error('CAPTCHA invalid ');
                }
                return true;
            })
    ],
    navController.postContact
);

module.exports = router;
