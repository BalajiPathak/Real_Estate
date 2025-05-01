const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const { validationResult } = require('express-validator');  
const Blog = require('../models/blog');
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  
        const blogs = await Blog.find();  

        res.render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: null,
            validationErrors: [], // Add this
            oldInput: {          // Add this
                Email: '',
                Password: ''
            },
            companyInfo: companyInfo,
            navbar: navbar,
            blogs:blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'An error occurred during login',
            validationErrors: [], // Add this
            oldInput: {          // Add this
                Email: '',
                Password: ''
            }
        });
    }
};

exports.getSignup = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  
        const blogs = await Blog.find();    

        res.render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: null,  // Changed from req.flash('error')
            validationErrors: [],
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Password: ''
            },
            companyInfo: companyInfo,
            navbar: navbar,
            blogs:blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: 'An error occurred',
            validationErrors: [],
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Password: ''
            }
        });
    }
};

exports.postSignup = async (req, res) => {
    try {
        const { First_Name, Last_Name, Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();  // Add blogs

        // Check if email already exists first
        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'Signup',
                path: '/signup',
                errorMessage: 'Email is already in use. Please use a different email address.',  // Updated error message
                validationErrors: [{ param: 'Email' }],
                oldInput: {
                    First_Name,
                    Last_Name,
                    Email,
                    Password
                },
                companyInfo,
                navbar,
                blogs,  // Add blogs
                isLoggedIn: req.session.isLoggedIn
            });
        }

        // Rest of validation
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'Signup',
                path: '/signup',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: {
                    First_Name: First_Name,
                    Last_Name: Last_Name,
                    Email: Email,
                    Password: Password
                },
                companyInfo: companyInfo,
                navbar: navbar,
                isLoggedIn: req.session.isLoggedIn
            });
        }

        if (!First_Name || !Last_Name || !Email || !Password) {
            return res.status(400).render('auth/signup', {
                pageTitle: 'Signup',
                path: '/signup',
                errorMessage: errors.array()[0].msg,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(Password, 12);

        // Create new user
        const user = new User({
            First_Name,
            Last_Name,
            Email,
            Password: hashedPassword
        });

        await user.save();
        res.redirect('/login');

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: 'An error occurred during signup'
        });
    }
};


exports.postLogin = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();  // Add blogs
        // Format validation (email format and password length)
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                
                oldInput: {
                    Email: Email,
                    Password: Password
                },
                companyInfo: companyInfo,
                navbar: navbar,
                blogs:blogs,
                isLoggedIn: false
            });
        }

        const user = await User.findOne({ Email });
        
        // User not found
        if (!user) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password',
                validationErrors: [{ param: 'Email' }],
                oldInput: {
                    Email: Email,
                    Password: Password
                },
                companyInfo: companyInfo,
                navbar: navbar,
                blogs: blogs || [],
                isLoggedIn: false
            });
        }

        const isValidPassword = await bcrypt.compare(Password, user.Password);
        
        // Password mismatch
        if (!isValidPassword) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Password didn\'t match', // Updated error message
                validationErrors: [{ param: 'Password' }],
                oldInput: {
                    Email: Email,
                    Password: Password
                },
                companyInfo: companyInfo,
                navbar: navbar,
                blogs: blogs || [],
                isLoggedIn: false
            });
        }

        // Success case continues...
        const token = jwt.sign(
            { userId: user._id, email: user.Email },
            'your-jwt-secret',
            { expiresIn: '24h' }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        req.session.isLoggedIn = true;
        req.session.userId = user._id;

        res.redirect('/home');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'An error occurred during login'
        });
    }
};

// Add this to your existing middleware or create a new one


exports.postLogout = (req, res) => {

    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Logout failed' });
        }

        res.clearCookie('jwt');

        res.redirect('/home');
    });
};

exports.getReset = async(req, res) => {
    const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/reset',
        errorMessage: null,
        CompanyInfo: CompanyInfo,
            Navbar:Navbar
    });
};

exports.postReset = async (req, res) => {
    try {
        if (!req.body.Email) {
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'Please provide an email address.'
            });
        }

        const buffer = await new Promise((resolve, reject) => {
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(buffer);
                }
            });
        });

        const token = buffer.toString('hex');
        const user = await User.findOne({ Email: req.body.Email });

        if (!user) {
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'No account with that email found.'
            });
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
        await user.save();

        try {
            await transporter.sendMail({
                to: req.body.Email,
                from: 'balajipathak@startbitsolutions.com',
                subject: 'Password Reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3006/reset/${token}">link</a> to set a new password.</p>
                `
            });
            
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'Reset link sent to your email.'
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            await user.save();
            
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'Failed to send reset email. Please try again.'
            });
        }
    } catch (err) {
        console.error('Reset password error:', err);
        return res.render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: 'An error occurred. Please try again.'
        });
    }
};

exports.getNewPassword = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  
        const token = req.params.token;
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/login');
        }

        res.render('auth/new-password', {
            pageTitle: 'New Password',
            path: '/new-password',
            userId: user._id.toString(),
            resetToken: token,
            errorMessage: null,
            CompanyInfo: CompanyInfo,
            Navbar:Navbar
        });

    } catch (err) {
        console.error('Get new password error:', err);
        res.redirect('/login');
    }
};

exports.postNewPassword = async (req, res) => {
    try {
        const { Password, userId, resetToken } = req.body;
        const user = await User.findOne({
            _id: userId,
            resetToken: resetToken,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.redirect('/login');
        }

        const hashedPassword = await bcrypt.hash(Password, 12);
        user.Password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.redirect('/login');

    } catch (err) {
        console.error('Post new password error:', err);
        res.redirect('/reset');
    }
};