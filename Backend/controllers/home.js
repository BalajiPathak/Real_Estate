const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');

const getHome = async (req, res) => {
    try {
       
        const [companyInfo, navbar] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find()
        ]);
      
        res.render('index', {
            pageTitle: 'Real Estate',
            companyInfo: companyInfo || {},
            navbar: navbar || [],
            errorMessage: null,
            validationErrors: [],
        });
    } catch (error) {
        console.error('Error in home controller:', error);
        res.status(500).render('error', {
            pageTitle: 'Error',
            error: error.message
        });
    }
};

module.exports = {
    getHome
};