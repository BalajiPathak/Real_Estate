const express = require('express');
const authController = require('../controllers/auth');
const passport = require('passport')
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');


const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
 
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, '../logs/auth.log'),
  { flags: 'a' }
);
 
// Apply morgan only to auth routes
router.use(morgan('combined', { stream: accessLogStream }));


router.get('/signup', authController.getSignup);
router.get('/login', authController.getLogin);
router.post('/login', [
    check('Email')
        .isEmail()
        .withMessage('Please enter a valid email address'),
    check('Password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long')
], authController.postLogin);

router.post('/signup', [
    check('Email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    check('Password')
        .isLength({ min: 5 })
        .withMessage('Password must be at least 5 characters long')
        .trim(),
    check('First_Name')
        .notEmpty()
        .withMessage('First name is required'),
    check('Last_Name')
        .notEmpty()
        .withMessage('Last name is required')
], authController.postSignup);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        req.session.isLoggedIn = true;
        req.session.user = req.user;
        
        req.session.save(err => {
            if (err) console.error('Session save error:', err);
            res.redirect('/home');
        });
    }
);

// Add Facebook authentication route
router.get('/auth/facebook',
    passport.authenticate('facebook', { 
        scope: ['email', 'public_profile'],
        prompt: 'select_account'
    })
);

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
        failureRedirect: '/login',
        failureFlash: true
    }),
    (req, res) => {
        req.session.isLoggedIn = true;
        req.session.user = req.user;
        
        req.session.save(err => {
            if (err) console.error('Session save error:', err);
            res.redirect('/home');
        });
    }
);
module.exports = router;
