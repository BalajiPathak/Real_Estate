
const CompanyInfo = require('../models/companyInfo');  
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
const isAgent = require('./isAgent');

exports.handle404 = async (req, res, next) => {
    try {
        const [companyInfo, navbar, blogs] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Blog.find({})
        ]);

        res.status(404).render('pages/404', {
            pageTitle: 'Page Not Found',
            path: '/404',
            companyInfo: companyInfo || {},
            navbar: navbar || [],
            blogs: blogs || [],
            isLoggedIn: req.session && req.session.isLoggedIn || false,
            isAgent:eq.session && req.session.isAgent || false,  // Add this line
            validationErrors: [],
            errorMessage: null
        });
    } catch (err) {
        next(err);  
    }
};

exports.handle500 = async (err, req, res, next) => {
    try {
        const [companyInfo, navbar, blogs] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Blog.find({})
        ]);

        console.error(err.stack);

        res.status(500).render('pages/500', {
            pageTitle: 'Error',
            path: '/500',
            companyInfo: companyInfo,
            navbar: navbar,
            blogs: blogs,
            isLoggedIn: req.session && req.session.isLoggedIn || false,
            isAgent: req.session && req.session.isAgent || false,  // Add this line
            error: process.env.NODE_ENV === 'production' ? err : {}
        });
    } catch (fetchError) {
        console.error('Error fetching companyInfo or navbar in 500 handler:', fetchError);
        res.status(500).render('pages/500', {
            pageTitle: 'Error',
            path: '/500',
            companyInfo: null,
            navbar: null,
            blogs: null,
            isLoggedIn: req.session && req.session.isLoggedIn || false,
            isAgent: req.session && req.session.isAgent || false,  // Add this line
            error: process.env.NODE_ENV === 'production' ? err : {}
        });
    }
};
