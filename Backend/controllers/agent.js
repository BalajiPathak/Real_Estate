const User = require('../models/user');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const UserType = require('../models/userType'); // Add this import
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const AgentMessage = require('../models/agentMessage');

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
            isLoggedIn: req.session.isLoggedIn || false,
            isAgent: req.session.isAgent || false  // Add this line
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
            },
            isLoggedIn: false,
            isAgent: false  // Add this line
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
                isLoggedIn: false,
                isAgent: false
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
                errorMessage: 'No account exists with this email',
                validationErrors: [{ param: 'Email' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false,
                isAgent: false
            });
        }

        const isValidPassword = await bcrypt.compare(Password, user.Password);
        if (!isValidPassword) {
            return res.status(401).render('agent/login', {
                pageTitle: 'Agent Login',
                path: '/agent/login',
                errorMessage: 'Password didn\'t match',
                validationErrors: [{ param: 'Password' }],
                oldInput: { Email, Password },
                companyInfo, navbar, blogs,
                isLoggedIn: false,
                isAgent: false
            });
        }

        // If everything is valid, set up the session
        req.session.isLoggedIn = true;
        req.session.isAgent = true;
        req.session.user = user;
        req.session.userId = user._id;


        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.redirect('/agent/login');
            }
            res.redirect('/home');
        });

    } catch (err) {
         const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        console.error('Agent Login error:', err);
        res.status(500).render('agent/login', {
            pageTitle: 'Agent Login',
            path: '/agent/login',
            errorMessage: 'An error occurred during login',
            validationErrors: [],
            oldInput: { Email, Password },
            companyInfo, navbar, blogs,
            isLoggedIn: false,
            isAgent: false
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
            isLoggedIn: req.session.isLoggedIn || false,
            isAgent: req.session.isAgent || false  // Add this line
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
            },
            isLoggedIn: false,
            isAgent: false  // Add this line
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

exports.getMessages = async (req, res) => {
    try {
        const messages = await AgentMessage.find()
            .sort({ timestamp: -1 })
            .limit(50);
            const companyInfo = await CompanyInfo.findOne();
            const navbar = await Navbar.find();
            const blogs = await Blog.find();
        res.render('contact', {
            pageTitle: 'Messages',
            path: '/contact',
            messages,
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn,
            isAgent: req.session.isAgent,
            user: req.session.user,
            errorMessage: null
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, message: 'Error fetching messages' });
    }
};

exports.postMessage = async (req, res) => {
    try {
        if (!req.session.isAgent) {
            return res.status(403).json({ 
                success: false, 
                message: 'Only agents can send messages' 
            });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ 
                success: false, 
                message: errors.array()[0].msg 
            });
        }

        const { content } = req.body;
        
        if (!req.session.user || !req.session.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User session not found' 
            });
        }

        const message = new AgentMessage({
            content,
            agentName: `${req.session.user.First_Name} ${req.session.user.Last_Name}`,
            agentId: req.session.userId,
            timestamp: new Date()
        });

        await message.save();

        // Get the Socket.IO instance and emit the message
        const io = req.app.get('io');
        if (io) {
            io.emit('newAgentMessage', {
                content: message.content,
                agentName: message.agentName,
                timestamp: message.timestamp,
                _id: message._id
            });
        }

        res.status(201).json({ 
            success: true, 
            message: 'Message sent successfully',
            data: message 
        });

    } catch (err) {
        console.error('Post Message Error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Error sending message' 
        });
    }
};