const express = require('express');
const authController = require('../controllers/auth');
const passport = require('passport')
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
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
        const token = jwt.sign(
            { userId: req.user._id },
            authConfig.jwt.secret,
            { expiresIn: authConfig.jwt.expiresIn }
        );
        
        req.session.isLoggedIn = true;
        req.session.user = req.user;
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        res.redirect('/home');
    }
);

// Add these routes after your existing Google auth routes

router.get('/auth/facebook',
    passport.authenticate('facebook', { 
        scope: ['email', 'public_profile']
    })
);

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { 
        failureRedirect: '/login',
        failureFlash: true,
        failureMessage: true
    }),
    (req, res) => {
        // Only proceed if authentication was successful
        if (req.user) {
            const token = jwt.sign(
                { userId: req.user._id },
                authConfig.jwt.secret,
                { expiresIn: authConfig.jwt.expiresIn }
            );
            
            req.session.isLoggedIn = true;
            req.session.user = req.user;
            
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            res.redirect('/home');
        } else {
            // If there's an error message, pass it to the login page
            res.redirect('/login?error=' + encodeURIComponent(req.session.messages[0]));
        }
    }
);
module.exports = router;
