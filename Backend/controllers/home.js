const CompanyInfo = require('../models/companyInfo');

const getHome = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        res.render('index', { 
            pageTitle: 'Real Estate',
            companyInfo: companyInfo || {},
            isLoggedIn: false,
            path: '/'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error loading home page' });
    }
};

module.exports = {
    getHome
};