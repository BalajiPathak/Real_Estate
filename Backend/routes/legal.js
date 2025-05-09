const express = require('express');
const router = express.Router();
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

router.get('/privacy-policy', async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('legal/privacy-policy', {
            pageTitle: 'Privacy Policy',
            path: '/privacy-policy',
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn || false
        });
    } catch (error) {
        console.error('Privacy Policy Error:', error);
        res.status(500).send('Error loading privacy policy');
    }
});

router.get('/terms-of-service', async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('legal/terms-of-service', {
            pageTitle: 'Terms of Service',
            path: '/terms-of-service',
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn || false
        });
    } catch (error) {
        console.error('Terms of Service Error:', error);
        res.status(500).send('Error loading terms of service');
    }
});

router.get('/data-deletion', async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('legal/data-deletion', {
            pageTitle: 'Data Deletion Instructions',
            path: '/data-deletion',
            companyInfo,
            navbar,
            blogs,
            isLoggedIn: req.session.isLoggedIn || false
        });
    } catch (error) {
        console.error('Data Deletion Page Error:', error);
        res.status(500).send('Error loading data deletion instructions');
    }
});

module.exports = router;