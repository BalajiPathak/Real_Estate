
const CompanyInfo = require('../models/companyInfo');  
const Navbar = require('../models/navbar');

// 404 Error handler
exports.handle404 = async (req, res, next) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  

        res.status(404).render('pages/404', {
            pageTitle: 'Page Not Found',
            path: '/404',
            companyInfo: companyInfo,
            navbar: navbar,
            isLoggedIn: req.session && req.session.isLoggedIn || false
        });
    } catch (err) {
        next(err);  
    }
};

exports.handle500 = async (err, req, res, next) => {
    try {
        const companyInfo = await CompanyInfo.findOne();  
        const navbar = await Navbar.find();  

        console.error(err.stack); 

        res.status(500).render('pages/500', {
            pageTitle: 'Error',
            path: '/500',
            companyInfo: companyInfo,
            navbar: navbar,
            isLoggedIn: req.session && req.session.isLoggedIn || false,
            error: process.env.NODE_ENV === 'development' ? err : {} ///for future reference 
        });
    } catch (fetchError) {
        console.error('Error fetching companyInfo or navbar in 500 handler:', fetchError);
        res.status(500).render('pages/500', {
            pageTitle: 'Error',
            path: '/500',
            companyInfo: null,
            navbar: null,
            isLoggedIn: req.session && req.session.isLoggedIn || false,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
};
