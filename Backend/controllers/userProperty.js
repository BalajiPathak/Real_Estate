// Add these imports at the top
const mongoose = require('mongoose');
const PropertyVideo = require('../models/propertyVideo');
const { PropertyFeature, PropertyDataFeature } = require('../models/propertyFeature');
const { validationResult } = require('express-validator');
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

        const property = await Property.findById(propertyId)
            .populate('stateId')
            .populate('categoryId')
            .populate('statusId')
            .populate('cityId');

        if (!property) {
            return res.status(404).redirect('/myproperties');
        }

        const [cities, states] = await Promise.all([
            City.find({ stateId: property.stateId._id }),
            State.find()
        ]);

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
            PropertyDataFeature.find({ propertyId }),
            PropertyVideo.find({ propertyId }),
            PropertyImage.find({ propertyId }),
            PropertyFeature.find(),
            CompanyInfo.findOne(),
            Navbar.find().sort({ _id: 1 }),
            Category.find(),
            Status.find(),
            Blog.find()
        ]);

        const selectedFeatureIds = propertyFeatures.map(pf => pf.featureId.toString());
        const videoLinks = propertyVideos.map(v => v.video);  // Extract just video URLs

        // Construct full image URLs by prepending '/uploads/' to the image filename
        let galleryImages = propertyImages.map(i => {
            if (i.image) {
                return '/uploads/' + i.image;  // Add /uploads/ if the image exists
            } else {
                return '/uploads/nothing';  // Default image if no image is found
            }
        });

        // If there are no images, set a default "no image" path
        if (galleryImages.length === 0) {
            galleryImages = ['/uploads/nothing'];  // Ensure at least one placeholder image is shown
        }

        res.render('property/edit', {
            pageTitle: 'Edit Property',
            path: '/myproperties',
            property,
            cities,
            states,
            categories,
            statuses,
            features: allFeatures,
            selectedFeatureIds,
            blogs: blogs || [],
            companyInfo: companyInfo || {},
            navbar: navbars || [],
            user: req.user || req.session.user,
            isLoggedIn: req.session.isLoggedIn || false,
            isAgent: req.session.isAgent || false,
            uploadsPath: '/uploads/',
            videoLinks,
            galleryImages
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
    const errors = validationResult(req);
if (!errors.isEmpty()) {
  console.log("Validation errors:", errors.array());
    try {
        const propertyId = req.params.id;
        
        // Check if the property ID is valid
        if (!mongoose.Types.ObjectId.isValid(propertyId)) {
            return res.status(400).redirect('/myproperties');
        }

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).redirect('/myproperties');

        // Ensure the user owns this property
        const userId = req.user?._id || req.session.user?._id;
        if (property.userId.toString() !== userId.toString()) {
            return res.status(403).redirect('/myproperties');
        }

        // Verify city-state relationship
        if (!mongoose.Types.ObjectId.isValid(req.body.cityId) || !mongoose.Types.ObjectId.isValid(req.body.stateId)) {
            return res.status(400).redirect('/myproperties');
        }

        const cityExists = await City.findOne({
            _id: req.body.cityId,
            stateId: req.body.stateId
        });

        if (!cityExists) {
            console.error('Selected city does not belong to the selected state');
            return res.status(400).redirect('/myproperties');
        }

        // Prepare the property update data
        const updateData = {
            name: req.body.name,
            price: req.body.price,
            saleStatus: "available",
            phone: req.body.phone,
            description: req.body.description,
            stateId: req.body.stateId,
            cityId: req.body.cityId,
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

        await Property.findByIdAndUpdate(propertyId, updateData);

        // Handle features
        if (req.body.featureIds) {
            await PropertyDataFeature.deleteMany({ propertyId });
            const featureIds = Array.isArray(req.body.featureIds) ? req.body.featureIds : [req.body.featureIds];
            await Promise.all(featureIds.map(featureId => {
                if (mongoose.Types.ObjectId.isValid(featureId)) {
                    return PropertyDataFeature.create({ propertyId, featureId });
                }
            }));
        }

        // Handle existing images first
        if (req.body.existingImages && req.body.imageIds) {
            const existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
            const imageIds = Array.isArray(req.body.imageIds) ? req.body.imageIds : [req.body.imageIds];

            await Promise.all(imageIds.map((id, index) => {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    return PropertyImage.findByIdAndUpdate(id, {
                        imagePath: existingImages[index].replace('/uploads/', '')
                    });
                }
            }));
        }

        // Handle new gallery images
        if (req.files && req.files.galleryImages) {
            const newImages = req.files.galleryImages.map(file => ({
                propertyId,
                imagePath: file.filename
            }));
            await PropertyImage.insertMany(newImages);
        }

        // Handle existing videos first
        if (req.body.existingVideos && req.body.videoIds) {
            const existingVideos = Array.isArray(req.body.existingVideos) ? req.body.existingVideos : [req.body.existingVideos];
            const videoIds = Array.isArray(req.body.videoIds) ? req.body.videoIds : [req.body.videoIds];

            await Promise.all(videoIds.map((id, index) => {
                if (mongoose.Types.ObjectId.isValid(id)) {
                    return PropertyVideo.findByIdAndUpdate(id, {
                        video: existingVideos[index]
                    });
                }
            }));
        }

        // Handle new video links
        if (req.body.videoLink) {
            const newVideoLinks = Array.isArray(req.body.videoLink) ? req.body.videoLink : [req.body.videoLink];
            const validNewLinks = newVideoLinks.filter(link => link && link.trim());
            
            if (validNewLinks.length > 0) {
                const newVideos = validNewLinks.map(video => ({
                    propertyId,
                    video: video.trim()
                }));
                await PropertyVideo.insertMany(newVideos);
            }
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

}