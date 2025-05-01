const Navbar = require('../models/navbar');
const CompanyInfo = require('../models/companyInfo');
const ContactForm = require('../models/contactForm');
const { validationResult } = require('express-validator');

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
            isLoggedIn: req.isLoggedIn || false,
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
        const navbar = await Navbar.find();
        const companyInfo = await CompanyInfo.findOne();
        
        res.render('contact', {
            navbar: navbar,          
            companyInfo: companyInfo,
            isLoggedIn: req.session.isLoggedIn || false,  // Use session status consistently
            pageTitle: 'Contact Us',
            errorMessage: null,
            validationErrors: [], 
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Subject: '',
                Message: ''
            }
        });
    } catch (error) {
        console.error('Error loading contact page:', error);
        res.status(500).render('contact', {
            errorMessage: 'An error occurred while loading the page',
            validationErrors: [],
            oldInput: {
                First_Name: '',
                Last_Name: '',
                Email: '',
                Subject: '',
                Message: ''
            },
            isLoggedIn: req.session.isLoggedIn || false  // Add isLoggedIn here too
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

        if (!errors.isEmpty()) {
            return res.status(422).render('contact', {
                navbar,
                companyInfo,
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
