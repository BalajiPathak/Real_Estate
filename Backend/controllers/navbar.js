const Navbar = require('../models/navbar');
const CompanyInfo = require('../models/companyInfo');

const createNavbar = async (req, res) => {
    try {
        const navbar = new Navbar({
            Navbar_Name: req.body.Navbar_Name
        });

        const savedNavbar = await navbar.save();
        
        res.status(201).json({ 
            message: 'Navbar created successfully', 
            navbar: savedNavbar 
        });
    } catch (error) {
        console.error('Error creating navbar:', error);
        res.status(500).json({ 
            message: 'Error creating navbar', 
            error: error.message 
        });
    }
};

const getAllNavbars = async (req, res) => {
    try {
        const navbar = await Navbar.find();  
        const companyInfo = await CompanyInfo.findOne();
        
        res.render('includes/navbar', { 
            pageTitle: 'Real Estate',
            navbar: navbar,  // Changed to match view
            companyInfo: companyInfo || {},
            isLoggedIn: false,
            path: '/'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching navbars', 
            error: error.message 
        });
    }
};

module.exports = {
    createNavbar,
    getAllNavbars
};