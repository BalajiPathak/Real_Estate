

const Property = require('../models/propertyData');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const City = require('../models/city');
const State = require('../models/state');
const Category = require('../models/propertyCategory');
const Status = require('../models/statusCategory');
const statusCategory = require('../models/statusCategory');
const Blog = require('../models/blog');


const propertyCategory = require('../models/propertyCategory');
const { PropertyFeature } = require('../models/propertyFeature'); // Correct import using destructuring
const FilterProperty = require('../models/filterProperty'); // Add FilterProperty import

exports.getUserProperties = async (req, res) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.redirect('/login');
        }

        // Get user data from session
        const user = req.session.user;
        
        // Normalize user data structure
        const userData = {
            First_Name: user.First_Name || user.firstName || user.given_name || 'User',
            // Add other user fields if needed
        };

        const properties = await Property.find({ userId: user._id })
            .populate('categoryId stateId statusId');

        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();

        res.render('userProperty/userProperty', {
            pageTitle: 'My Properties',
            path: '/myproperties',
            properties: properties,
            user: userData, // Pass normalized user data
            isLoggedIn: req.session.isLoggedIn,
            companyInfo: companyInfo || [],
            navbar: navbar || [],
            blogs: blogs || []
        });

    } catch (error) {
        console.error('Error in getUserProperties:', error);
        res.status(500).redirect('/home');
    }
};


exports.getEditProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const [
            property, 
            companyInfo, 
            navbars,
            cities,
            states,
            categories,
            statuses,
            propertyFeatures,
            blogs
        ] = await Promise.all([
            Property.findById(propertyId),
            CompanyInfo.findOne(),
            Navbar.find({}).sort({ _id: 1 }),
            City.find({}),
            State.find({}),
            propertyCategory.find({}),
            statusCategory.find({}),
            PropertyFeature.find({}),
            Blog.find()
        ]);

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        // Ensure features exists
        const propertyFeatureIds = property.features || [];

        res.render('property/edit', {
            pageTitle: 'Edit Property',
            property: property,
            path: '/myproperties',
            companyInfo: companyInfo,
            navbar: navbars,
            user: req.user || req.session.user,
            isLoggedIn: req.isAuthenticated() || !!req.session.user,
            cities: cities,
            states: states,
            propertyCategory: categories,
            categories: categories,
            statusCategory: statuses,
            statuses: statuses,
            propertyFeatures: propertyFeatures,
            features: propertyFeatures,
            blogs:blogs,
            propertyFeatureIds: propertyFeatureIds, // Add this line
            // Pass IDs directly from property
            cityId: property.cityId || '',
            stateId: property.stateId || '',
            categoryId: property.categoryId || '',
            statusId: property.statusId || '',
            name: property.name || '',
            price: property.price || '',
            description: property.description || '',
            beds: property.beds || '',
            baths: property.baths || '',
            area: property.area || '',
            phone: property.phone || '',
            image: property.image || '',
            videoLinks: property.videoLinks || [],
            galleryImages: property.galleryImages || [],
            featureIds: property.features || [],
            uploadsPath: '/uploads/'
        });
    } catch (error) {
        console.error('Error in getEditProperty:', error);
        res.status(500).redirect('/myproperties');
    }
};

// Update property
exports.postEditProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        // Check if the property belongs to the logged-in user
        if (property.userId.toString() !== (req.user?._id || req.session.user._id).toString()) {
            return res.status(403).redirect('/myproperties');
        }

        // Update property fields
        property.name = req.body.name;
        property.price = req.body.price;
        property.description = req.body.description;
        property.beds = req.body.beds;
        property.baths = req.body.baths;
        property.area = req.body.area;
        property.categoryId = req.body.categoryId;
        property.stateId = req.body.stateId;
        property.statusId = req.body.statusId;
        property.phone = req.body.phone;

        // Handle main image upload
        if (req.files && req.files.mainImage && req.files.mainImage[0]) {
            property.image = req.files.mainImage[0].filename;
        }

        // Handle gallery images
        if (req.files && req.files.galleryImages) {
            const galleryImages = req.files.galleryImages.map(file => file.filename);
            property.galleryImages = galleryImages;
        }

        await property.save();
        res.redirect('/myproperties');
    } catch (error) {
        console.error('Error in postEditProperty:', error);
        res.status(500).redirect('/myproperties');
    }
};

// Delete property
exports.deleteProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        // Check if the property belongs to the logged-in user
        if (property.userId.toString() !== (req.user?._id || req.session.user._id).toString()) {
            return res.status(403).redirect('/myproperties');
        }

        await Property.findByIdAndDelete(propertyId);
        res.redirect('/myproperties');
    } catch (error) {
        console.error('Error in deleteProperty:', error);
        res.status(500).redirect('/myproperties');
    }
};

