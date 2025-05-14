const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserType = require('../models/userType');  
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const { validationResult } = require('express-validator');  
const Blog = require('../models/blog');
// Update this section
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
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
            isLoggedIn: req.session.isLoggedIn,
             isAgent: req.session.isAgent || false,
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
            isLoggedIn: req.session.isLoggedIn,
             isAgent: req.session.isAgent || false,
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
                isLoggedIn: req.session.isLoggedIn,
                 isAgent: req.session.isAgent || false,
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
                blogs,
                isLoggedIn: req.session.isLoggedIn,
                 isAgent: req.session.isAgent || false,
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
 
        // Find local user type
        const localType = await UserType.findOne({ user_type_name: 'local' });
        
        if (!localType) {
            throw new Error('Local user type not found');
        }

        // Create new user
        const user = new User({
            First_Name,
            Last_Name,
            Email,
            Password: hashedPassword,
            user_type_id: localType._id,
            is_verified: false
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
 
exports.postLogin = async (req, res, next) => {
    try {
        const { Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        // Format validation check
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false,
                 isAgent: false,
            });
        }

        // Find user first
        const user = await User.findOne({ Email });
        
        // Check if user exists
        if (!user) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'No user found with this account ',
                validationErrors: [{ param: 'Email' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false,
                 isAgent: false,
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(Password, user.Password);
        
        if (!isValidPassword) {
            return res.status(401).render('auth/login', {
                pageTitle: 'Login',
                path: '/login',
                errorMessage: 'Password didn\t match!!! ',
                validationErrors: [{ param: 'Password' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false,
                 isAgent: false,
            });
        }

        // Login successful - set session
        req.session.isLoggedIn = true;
        req.session.isAgent = false;
        req.session.user = user;
        req.session.userId = user._id;

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.Email },
            'your-jwt-secret',
            { expiresIn: '24h' }
        );

        // Set cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        // Save session and redirect
        return req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return next(err);
            }
            res.redirect('/home');
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'An error occurred during login',
            validationErrors: [],
            oldInput: { Email: '', Password: '' },
            companyInfo: null,
            navbar: [],
            blogs: [],
            isLoggedIn: false,
             isAgent: false,
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
    try {
        const companyInfo = await CompanyInfo.findOne();  // Changed from find() to findOne()
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        
        res.render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: null,
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session ? req.session.isLoggedIn : false,
             isAgent: false,
        });
    } catch (err) {
        console.error('Reset page error:', err);
        res.status(500).render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: 'An error occurred',
            companyInfo: null,
            navbar: [],
            blogs: [],
            isLoggedIn: false,
             isAgent: false,
        });
    }
};
 
exports.postReset = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  // Changed from find() to findOne()
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        if (!req.body.Email) {
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                companyInfo: companyInfo,
                navbar:navbar,
                blogs:blogs,
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
                errorMessage: 'No account with that email found.',
                companyInfo: companyInfo,
                navbar:navbar,
                blogs:blogs,

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
                    <p>Click this <a href="${process.env.BASE_URL || 'http://localhost:3006'}/reset/${token}">link</a> to set a new password.</p>
                `
            });
           
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'Reset link sent to your email.',
                companyInfo: companyInfo,
                navbar:navbar,
                blogs:blogs,
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            user.resetToken = undefined;
            user.resetTokenExpiration = undefined;
            await user.save();
           
            return res.render('auth/reset', {
                pageTitle: 'Reset Password',
                path: '/reset',
                errorMessage: 'Failed to send reset email. Please try again.',
                companyInfo: companyInfo,
                navbar:navbar,
                blogs:blogs,
            });
        }
    } catch (err) {
        const companyInfo = await CompanyInfo.find({});  
        const navbar = await Navbar.find();
        const blogs = await Blog.find();  
        console.error('Reset password error:', err);
        return res.render('auth/reset', {
            pageTitle: 'Reset Password',
            path: '/reset',
            errorMessage: 'An error occurred. Please try again.',
            companyInfo: companyInfo,
            navbar:navbar,
            blogs:blogs,
        });
    }
};
 
exports.getNewPassword = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find(); 
        const blogs = await Blog.find();  // Add blogs
   
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
            companyInfo: companyInfo,
            navbar:navbar,
            blogs:blogs,
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
 