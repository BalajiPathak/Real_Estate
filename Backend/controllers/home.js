const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Banner = require('../models/banner');
const BannerDetails = require('../models/bannerDetails');

const getHome = async (req, res) => {
    try {
        const [companyInfo, navbar, banners] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Banner.find().populate('banner_detail_id')  // Changed from findOne to find()
        ]);

        const isLoggedIn = req.session.isLoggedIn || false;
        
        res.render('index', {
            pageTitle: 'Real Estate',
            companyInfo: companyInfo || {},
            navbar: navbar || [],
            banners: banners || [],  // Changed from banner to banners
            banner: banners[0] || {}, // Add this for single banner reference
            errorMessage: null,
            validationErrors: [],
            isLoggedIn: isLoggedIn
        });
    } catch (error) {
        console.error('Error in home controller:', error);
        res.status(500).render('error', {
            pageTitle: 'Error',
            error: error.message,
            isLoggedIn: false
        });
    }
};

const createBannerDetails = async (req, res) => {
    try {
        const { Title, Tag_line } = req.body;
        
        const bannerDetails = new BannerDetails({
            Title,
            Tag_line
        });

        const savedBannerDetails = await bannerDetails.save();

        res.status(201).json({
            message: 'Banner details created successfully',
            bannerDetails: savedBannerDetails
        });
    } catch (error) {
        console.error('Error creating banner details:', error);
        res.status(500).json({
            message: 'Error creating banner details',
            error: error.message
        });
    }
};

const createBanner = async (req, res) => {
    try {
        const { Banner_Img, banner_detail_id } = req.body;
        const homeNavbar = await Navbar.findOne({ Navbar_Name: 'Home' });
        
        if (!homeNavbar) {
            return res.status(404).json({
                message: 'Home navbar not found'
            });
        }

        const banner = new Banner({
            Banner_Img,
            Navbar_Id: homeNavbar._id,
            banner_detail_id
        });

        const savedBanner = await banner.save();

        res.status(201).json({
            message: 'Banner created successfully',
            banner: savedBanner
        });
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({
            message: 'Error creating banner',
            error: error.message
        });
    }
};

const getBanners = async (req, res) => {
    try {
        const [banners, navbar, companyInfo] = await Promise.all([
            Banner.find().populate('banner_detail_id'),
            Navbar.find(),
            CompanyInfo.findOne()
        ]);

        res.render('admin/banners', {
            pageTitle: 'Banner Management',
            banners: banners || [],
            navbar: navbar || [],
            companyInfo: companyInfo || {},
            errorMessage: null,
            validationErrors: [],
            isLoggedIn: req.session.isLoggedIn || false
        });
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).render('error', {
            pageTitle: 'Error',
            error: error.message,
            isLoggedIn: false
        });
    }
};

module.exports = {
    getHome,
    createBanner,
    createBannerDetails,
    getBanners
};