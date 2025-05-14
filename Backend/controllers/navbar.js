const Navbar = require('../models/navbar');
const CompanyInfo = require('../models/companyInfo');
const ContactForm = require('../models/contactForm');
const { validationResult } = require('express-validator');
const Blog = require('../models/blog');


const createNavbar = async (req, res) => {
    try {
        const navbar = new Navbar({
            Navbar_Name: req.body.Navbar_Name
        });
        const savedNavbar = await navbar.save();
        res.status(201).json({
            message: 'Navbar created successfully',
            navbar: savedNavbar,
            isLoggedIn: req.isLoggedIn || false
        });
    } catch (error) {
        console.error('Error creating navbar:', error);
        res.status(500).json({
            message: 'Error creating navbar',
            error: error.message,
            isLoggedIn: req.isLoggedIn || false
        });
    }
};

const getAllNavbars = async (req, res) => {
    try {
        const navbar = await Navbar.find();
        const companyInfo = await CompanyInfo.findOne();
        
        res.render('index', {
            navbar: navbar,          
            companyInfo: companyInfo,
            isLoggedIn: req.session.isLoggedIn || false,
            isAgent: req.session.isAgent || false,  // Add this line
            pageTitle: 'Real Estate'
        });
    } catch (error) {
        console.error('Error fetching navbars:', error);
        res.status(500).json({
            message: 'Error fetching navbars',
            error: error.message,
            isLoggedIn: req.isLoggedIn || false
        });
    }
};

const getContact = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('contact', {
            pageTitle: 'Contact',
            path: '/contact',
            errorMessage: null,
            validationErrors: [],
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Subject: '',
                Message: ''
            },
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn,
            isAgent: req.session.isAgent || false,
            userName: req.session.user ? `${req.session.user.First_Name} ${req.session.user.Last_Name}` : ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('500', {
            pageTitle: 'Error',
            path: '/500'
        });
    }
};

// Also update postContact function
const postContact = async (req, res) => {
    try {
        const { firstname: First_Name, lastname: Last_Name, email: Email, subject: Subject, message: Message } = req.body;
        const errors = validationResult(req);
        const navbar = await Navbar.find();
        const companyInfo = await CompanyInfo.findOne();
        const blogs = await Blog.find(); 
        if (!errors.isEmpty()) {
            return res.status(422).render('contact', {
                navbar,
                companyInfo,
                blogs,
                pageTitle: 'Contact Us',
                errorMessage: errors.array()[0].msg,
                validationErrors: errors.array(), 
                oldInput: {
                    First_Name,
                    Last_Name,
                    Email,
                    Subject,
                    Message
                },
                isLoggedIn: req.session.isLoggedIn || false  // Use session status
            });
        }

        const contactForm = new ContactForm({
            First_Name,
            Last_Name,
            Email,
            Subject,
            Message
        });

        await contactForm.save();
        
        res.render('contact', {
            navbar,
            companyInfo,
            blogs,
            pageTitle: 'Contact Us',
            successMessage: 'Message sent successfully!',
            errorMessage: null,
            validationErrors: [],  
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Subject: '',
                Message: ''
            },
            isLoggedIn: req.session.isLoggedIn || false  // Use session status
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).render('contact', {
            navbar: await Navbar.find(),
            companyInfo: await CompanyInfo.findOne(),
            pageTitle: 'Contact Us',
            errorMessage: 'An error occurred while sending your message',
            oldInput: req.body,
            isLoggedIn: req.session.isLoggedIn || false  // Use session status
        });
    }
};

module.exports = {
    createNavbar,
    getAllNavbars,
    getContact,
    postContact
};
