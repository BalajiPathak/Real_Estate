// Add these imports at the top
const mongoose = require('mongoose');
const PropertyVideo = require('../models/propertyVideo');
const { PropertyFeature, PropertyDataFeature } = require('../models/propertyFeature');

const Property = require('../models/propertyData');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const City = require('../models/city');
const State = require('../models/state');
const Category = require('../models/propertyCategory');
const Status = require('../models/statusCategory');
const statusCategory = require('../models/statusCategory');
const Blog = require('../models/blog');
const PropertyImage = require('../models/propertyImage');


const propertyCategory = require('../models/propertyCategory');
const FilterProperty = require('../models/filterProperty'); // Add FilterProperty import

exports.getUserProperties = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect('/login');
    }
 
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
 
    const user = req.session.user;
    const userData = {
      First_Name: user.First_Name || user.firstName || user.given_name || 'User',
    };
 
    // Filter object
    const finalFilter = {
      userId: user._id,
      name: { $regex: searchQuery, $options: 'i' }, // Search by name
    };
 
    const totalPropertie = await Property.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalPropertie / limit);
 
    const propertie = await Property.find(finalFilter)
      .populate('categoryId stateId statusId cityId') // Add cityId to populate
      .skip(skip)
      .limit(limit);
 
    const companyInfo = await CompanyInfo.findOne();
    const navbar = await Navbar.find();
    const blogs = await Blog.find();
 
    res.render('userProperty/userProperty', {
      pageTitle: 'My Properties',
      path: '/myproperties',
      properties: propertie,
      user: userData,
      isLoggedIn: req.session.isLoggedIn,
      isAgent: req.session.isAgent,
      currentPage: page,
      totalPages,
      searchQuery, // pass to view
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || [],
    });
  } catch (error) {
    console.error('Error in getUserProperties:', error);
    res.status(500).redirect('/home');
  }
};
 


exports.getEditProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        
        // Get the base property data with all necessary populations
        const property = await Property.findById(propertyId)
            .populate('stateId')
            .populate('categoryId')
            .populate('statusId')
            .populate('cityId');

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        // Get all states and cities for the selected state
        const [states, cities] = await Promise.all([
            State.find(),
            City.find({ stateId: property.stateId._id })
        ]);

        // Fetch other related data
        const [
            propertyFeatures,
            propertyVideos,
            propertyImages,
            allFeatures,
            companyInfo, 
            navbars,
            categories,
            statuses,
            blogs
        ] = await Promise.all([
            PropertyDataFeature.find({ propertyId: propertyId }),
            PropertyVideo.find({ propertyId: propertyId }),
            PropertyImage.find({ propertyId: propertyId }),
            PropertyFeature.find(),
            CompanyInfo.findOne(),
            Navbar.find().sort({ _id: 1 }),
            Category.find(),
            Status.find(),
            Blog.find()
        ]);

        // Create arrays of IDs and data for the template
        const selectedFeatureIds = propertyFeatures.map(pf => pf.featureId.toString());
        const videoLinks = propertyVideos.map(pv => pv.videoUrl);
        const galleryImages = propertyImages.map(pi => pi.imagePath);

        res.render('property/edit', {
            pageTitle: 'Edit Property',
            path: '/myproperties',
            property: property,
            cities: cities,
            states: states,  // Now states is defined
            categories: categories,
            statuses: statuses,
            features: allFeatures,
            selectedFeatureIds: selectedFeatureIds,
            blogs: blogs || [],
            companyInfo: companyInfo || {},
            navbar: navbars || [],
            user: req.user || req.session.user,
            isLoggedIn: req.session.isLoggedIn || false,
            isAgent: req.session.isAgent || false,
            uploadsPath: '/uploads/',
            videoLinks: videoLinks,
            galleryImages: galleryImages
        });

    } catch (error) {
        console.error('Error in getEditProperty:', error);
        res.status(500).redirect('/myproperties');
    }
};

// Add this new function to handle city updates when state changes
exports.getCitiesByState = async (req, res) => {
    try {
        const { stateId } = req.params;
        const cities = await City.find({ stateId: stateId });
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ message: 'Failed to fetch cities' });
    }
};

exports.postEditProperty = async (req, res) => {
    try {
        const propertyId = req.params.id;
        const property = await Property.findById(propertyId);

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        // Check ownership
        if (property.userId.toString() !== (req.user?._id || req.session.user._id).toString()) {
            return res.status(403).redirect('/myproperties');
        }

        // Verify if the city belongs to the selected state
        const cityExists = await City.findOne({
            _id: req.body.cityId,
            stateId: req.body.stateId
        });

        if (!cityExists) {
            console.error('Selected city does not belong to the selected state');
            return res.status(400).redirect('/myproperties');
        }

        // Update basic property fields
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            saleStatus: "available",
            phone: req.body.phone,
            description: req.body.description,
            stateId: req.body.stateId,
            cityId: req.body.cityId,  // Make sure cityId is included
            categoryId: req.body.categoryId,
            statusId: req.body.statusId,
            beds: req.body.beds,
            baths: req.body.baths,
            area: req.body.area,
            termsAndConditions: req.body.termsAndConditions === 'true'
        };

        // Handle main image upload
        if (req.files && req.files.mainImage && req.files.mainImage[0]) {
            updateData.image = req.files.mainImage[0].filename;
        }

        // Update the main property data
        await Property.findByIdAndUpdate(propertyId, updateData);

        // Update features
        if (req.body.featureIds) {
            await PropertyDataFeature.deleteMany({ propertyId: propertyId });
            const featureIds = Array.isArray(req.body.featureIds) ? req.body.featureIds : [req.body.featureIds];
            await Promise.all(featureIds.map(featureId => 
                PropertyDataFeature.create({ propertyId, featureId })
            ));
        }

        // Update videos with proper propertyId reference
        if (req.body.videoLink) {
            await PropertyVideo.deleteMany({ propertyId: propertyId });
            const videoLinks = Array.isArray(req.body.videoLink) ? req.body.videoLink : [req.body.videoLink];
            await Promise.all(videoLinks
                .filter(link => link.trim() !== '')
                .map(videoUrl => PropertyVideo.create({ 
                    propertyId: new mongoose.Types.ObjectId(propertyId), // Convert to ObjectId
                    videoUrl 
                }))
            );
        }

        // Handle gallery images with proper propertyId reference
        if (req.files && req.files.galleryImages) {
            await PropertyImage.deleteMany({ propertyId: propertyId });
            await Promise.all(req.files.galleryImages.map(file => 
                PropertyImage.create({ 
                    propertyId: new mongoose.Types.ObjectId(propertyId), // Convert to ObjectId
                    imagePath: file.filename 
                })
            ));
        }

        // Update features with proper propertyId reference
        if (req.body.featureIds) {
            await PropertyDataFeature.deleteMany({ propertyId: propertyId });
            const featureIds = Array.isArray(req.body.featureIds) ? req.body.featureIds : [req.body.featureIds];
            await Promise.all(featureIds.map(featureId => 
                PropertyDataFeature.create({ 
                    propertyId: new mongoose.Types.ObjectId(propertyId), // Convert to ObjectId
                    featureId: new mongoose.Types.ObjectId(featureId) // Convert featureId to ObjectId as well
                })
            ));
        }

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

