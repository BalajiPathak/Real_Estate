const User = require('../models/user');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const UserType = require('../models/userType'); // Add this import
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

exports.getAgentLogin = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('agent/login', {
            pageTitle: 'Agent Login',
            path: '/agent/login',
            errorMessage: null,
            validationErrors: [],
            oldInput: {
                Email: '',
                Password: ''
            },
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error('Agent Login error:', err);
        res.status(500).render('agent/login', {
            pageTitle: 'Agent Login',
            path: '/agent/login',
            errorMessage: 'An error occurred',
            validationErrors: [],
            oldInput: {
                Email: '',
                Password: ''
            }
        });
    }
};

exports.postAgentLogin = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        if (!errors.isEmpty()) {
            return res.status(422).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        const user = await User.findOne({ 
            Email,
            user_type_id: { $exists: true } // Check if user is an agent
        });

        if (!user) {
            return res.status(401).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: 'Invalid email or password',
                validationErrors: [{ param: 'Email' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        const isValidPassword = await bcrypt.compare(Password, user.Password);

        if (!isValidPassword) {
            return res.status(401).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: 'Invalid email or password',
                validationErrors: [{ param: 'Password' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        req.session.isLoggedIn = true;
        req.session.isAgent = true;
        req.session.user = user;
        req.session.userId = user._id;

        return req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return next(err);
            }
            res.redirect('/home'); 
        });

    } catch (err) {
        console.error('Agent Login error:', err);
        res.status(500).render('agent/login', {
            pageTitle: 'Agent Login',
            path: '/agent/login',
            errorMessage: 'An error occurred during login',
            validationErrors: [],
            oldInput: { Email: '', Password: '' }
        });
    }
};

exports.getAgentSignup = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('agent/signup', {
            pageTitle: 'Agent Signup',
            path: '/agent/signup',
            errorMessage: null,
            validationErrors: [],
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Password: ''
            },
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error('Agent Signup error:', err);
        res.status(500).render('agent/signup', {
            pageTitle: 'Agent Signup',
            path: '/agent/signup',
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

exports.postAgentSignup = async (req, res) => {
    try {
        const { First_Name, Last_Name, Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        if (!errors.isEmpty()) {
            return res.status(422).render('agent/signup', {
                pageTitle: 'Agent Signup',
                path: '/agent/signup',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: { First_Name, Last_Name, Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        const existingUser = await User.findOne({ Email });
        if (existingUser) {
            return res.status(422).render('agent/signup', {
                pageTitle: 'Agent Signup',
                path: '/agent/signup',
                errorMessage: 'Email already exists',
                validationErrors: [{ param: 'Email' }],
                oldInput: { First_Name, Last_Name, Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        const hashedPassword = await bcrypt.hash(Password, 12);
        // Find agent type using user_type_name
        const agentType = await UserType.findOne({ user_type_name: 'agent' });

        if (!agentType) {
            throw new Error('Agent user type not found');
        }

        const user = new User({
            First_Name,
            Last_Name,
            Email,
            Password: hashedPassword,
            user_type_id: agentType._id, // Use the correct agent type ID
            is_verified: false
        });

        await user.save();
        res.redirect('/agent/login');

    } catch (err) {
        console.error('Agent Signup error:', err);
        res.status(500).render('agent/signup', {
            pageTitle: 'Agent Signup',
            path: '/agent/signup',
            errorMessage: 'An error occurred during signup',
            validationErrors: [],
            oldInput: { First_Name: '', Last_Name: '', Email: '', Password: '' }
        });
    }
};

exports.postAgentLogin = async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const errors = validationResult(req);
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        if (!errors.isEmpty()) {
            return res.status(422).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(),
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        // Find agent type first
        const agentType = await UserType.findOne({ user_type_name: 'agent' });
        
        if (!agentType) {
            throw new Error('Agent user type not found');
        }

        // Find user with matching email and agent type ID
        const user = await User.findOne({ 
            Email,
            user_type_id: agentType._id
        });

        if (!user) {
            return res.status(401).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: 'Invalid email or password',
                validationErrors: [{ param: 'Email' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        // Rest of the login logic remains the same
        const isValidPassword = await bcrypt.compare(Password, user.Password);
        if (!isValidPassword) {
            return res.status(401).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: 'Invalid email or password',
                validationErrors: [{ param: 'Password' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false
            });
        }

        req.session.isLoggedIn = true;
        req.session.isAgent = true;
        req.session.user = user;
        req.session.userId = user._id;

        return req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return next(err);
            }
            res.redirect('/home'); 
        });

    } catch (err) {
        console.error('Agent Login error:', err);
        res.status(500).render('agent/login', {
            pageTitle: 'Agent Login',
            path: '/agent/login',
            errorMessage: 'An error occurred during login',
            validationErrors: [],
            oldInput: { Email: '', Password: '' }
        });
    }
};