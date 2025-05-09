const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Banner = require('../models/banner');
const BannerDetails = require('../models/bannerDetails');
const PropertyData = require('../models/propertyData');
const PropertyCategory = require('../models/propertyCategory');
const State = require('../models/state');
const StatusCategory = require('../models/statusCategory');
const Testimonial = require('../models/testimonial');
const { PropertyFeature } = require('../models/propertyFeature');
const { PropertyDataFeature } = require('../models/propertyFeature');
const City = require('../models/city');
const PropertyVideo = require('../models/propertyVideo');
const Blog = require('../models/blog');

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

// Remove duplicate functions and keep only these versions
exports.postTestimonial = async (req, res) => {
    try {
        const testimonial = new Testimonial({
            clientName: req.body.clientName,
            designation: req.body.designation,
            testimonialText: req.body.testimonialText,
            clientImage: req.body.clientImage || 'assets/img/client-face1.png'  // Use direct image path
        });

        await testimonial.save();
        res.status(201).json({ message: 'Testimonial created successfully', testimonial });
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true })
            .sort({ createdAt: -1 });
        return testimonials;
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
    }
};

// Remove the first getHome function (lines 14-54)
// and update the exports.getHome function:

exports.getHome = async (req, res) => {
    try {
        const [companyInfo, navbar, banners, featuredProperties, testimonials, cities, statusCategory, propertyFeatures,blogs] = await Promise.all([
            CompanyInfo.findOne(),
            Navbar.find(),
            Banner.find().populate('banner_detail_id'),
            PropertyData.find({ beds: { $gt: 5},baths:{$gt :5} })
                .populate('categoryId')
                .populate('stateId')
                .populate('statusId')
                .limit(8),
            Testimonial.find().sort({ createdAt: -1 }),
            City.find(),
            StatusCategory.find(),
            PropertyFeature.find(),
            Blog.find()
        ]);

        res.render('index', {
            pageTitle: 'Real Estate',
            path: '/',
            companyInfo: companyInfo || {},
            navbar: navbar || [],
            banners: banners || [],
            banner: banners[0] || {},
            featuredProperties: featuredProperties || [],
            testimonials: testimonials || [],
            cities: cities || [],
            statusCategory: statusCategory || [],
            propertyFeatures: propertyFeatures || [],
            blogs:blogs||[],
            features: [],  // Add this line for selected features
            cityId: '',
            statusId: '',
            errorMessage: null,
            validationErrors: [],
            isLoggedIn: req.session.isLoggedIn || false
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', {
            pageTitle: 'Error',
            error: error.message,
            isLoggedIn: false
        });
    }
};

exports.getBanners = async (req, res) => {
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

exports.createBanner = async (req, res) => {
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

exports.createBannerDetails = async (req, res) => {
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