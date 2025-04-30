const mongoose = require('mongoose');

const PropertyData = require('../models/propertyData');
const { PropertyCategory } = require('../models/propertyCategory');
const { State } = require('../models/state');
// const { StatusCategory } = require('../models/statusCategory');
const { PropertyFeature } = require('../models/propertyFeature');
const PropertyImages = require('../models/propertyImage');
const { PropertyDataFeature } = require('../models/propertyFeature');
const City = require('../models/city');
const PropertyVideo = require('../models/propertyVideo');  

const FilterProperty = require('../models/filterProperty'); // Import the FilterProperty model
const StatusCategory = require('../models/statusCategory');
const crypto = require('crypto');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar')
const Blog = require('../models/blog');

exports.getAllProperties = async (req, res) => {
try {
 
 const page = parseInt(req.query.page) || 1;
 const limit = 12;
 const skip = (page - 1) * limit;
 // Fetch dynamic data for filter options
 
const cities = await City.find();
 const propertyFeatures = await PropertyFeature.find();
 const filterProperties = await FilterProperty.find();
 const statusCategory = await StatusCategory.find();
  const companyInfo = await CompanyInfo.findOne();  
   const navbar = await Navbar.find();  
   const blogs = await Blog.find();
 
 const filter = {};
 // Apply other filters if they exist
 
if (req.query.keyword) {
 filter.name = { $regex: req.query.keyword, $options: 'i' }; // Case-insensitive match
}
 if (req.query.cityId) {
 filter.cityId = req.query.cityId;
 }
 
if (req.query.statusId) {
 
  filter.statusId = req.query.statusId;
 
  }
 
if (req.query.priceRange) {
const [minPrice, maxPrice] = req.query.priceRange.split(',');
 filter.price = { $gte: minPrice, $lte: maxPrice };
 }
 
 if (req.query.areaRange) {
 const [minArea, maxArea] = req.query.areaRange.split(',');
 filter.area = { $gte: minArea, $lte: maxArea };
 }
if (req.query.minBaths) {
filter.baths = { $gte: parseInt(req.query.minBaths) };
}
 
 if (req.query.minBeds) {
 filter.beds = { $gte: parseInt(req.query.minBeds) };
 }
 
 
 // NEW: Filter by features (by feature name)
 if (req.query.features && req.query.features.length > 0) {
 // 1. Find matching feature IDs by name
 const selectedFeatures = await PropertyFeature.find({ name: { $in: req.query.features } });
 const selectedFeatureIds = selectedFeatures.map(f => f._id);
 
 
 // 2. Find matching property IDs
const propertyFeatureMappings = await PropertyDataFeature.find({ featureId: { $in: selectedFeatureIds } });
 const propertyIds = propertyFeatureMappings.map(pf => pf.propertyId);
 
 
// 3. Apply propertyIds to main filter
filter._id = { $in: propertyIds };
}
 
 
 
// Get the total count of properties matching the filter
 
 const totalProperties = await PropertyData.countDocuments(filter);
const totalPages = Math.ceil(totalProperties / limit);
 
 
 
// Fetch properties with the applied filters
const properties = await PropertyData.find(filter)
 
 .skip(skip)
 
.limit(limit);
 
 
 
 // Pass the filter properties for sliders to the view
res.render('property/property', {
pageTitle: 'Real Estate',

isLoggedIn:req.isLoggedIn || false,
 properties,
 
cities,
 propertyFeatures,
 
filterProperties,
 
currentPage: page,
totalPages,
statusCategory,
keyword: req.query.keyword || '',
 cityId: req.query.cityId || '',
 
 statusId: req.query.statusId || '',
 
priceRange: req.query.priceRange || '',
areaRange: req.query.areaRange || '',
minBaths: req.query.minBaths || '',
minBeds: req.query.minBeds || '',
companyInfo:companyInfo||[],
navbar:navbar ||[],
blogs:blogs ||[],
 features: req.query.features || [], // Pass selected features to the view
});
 
 
 
} catch (error) {
 
 console.error('Error fetching properties:', error);
 
  res.status(500).send('Server Error');
 }
 
 };

exports.getPropertyById = async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne();  
    const navbar = await Navbar.find();  
    const blogs = await Blog.find();
 
    // Fetch the property details and populate necessary fields
    const property = await PropertyData.findById(req.params.id)
      .populate('categoryId stateId statusId userId')  // Populate categoryId, stateId, etc.
      .lean();  // Returns plain JavaScript object

    if (!property) {
      return res.status(404).send('Property not found');
    }

    // Manually fetch the related feature data using the feature IDs stored in PropertyDataFeature
    const propertyFeatures = await PropertyDataFeature.find({ propertyId: property._id })
      .populate('featureId');
console.log('dsfsf',propertyFeatures);
    // Extract feature names from the populated featureId
    const featureNames = propertyFeatures.map(f => f.featureId.name);
console.log(featureNames);
    // Fetch images related to the property
    const images = await PropertyImages.find({ propertyId: property._id }).lean();

    // Fetch videos related to the property
    const videos = await PropertyVideo.find({ propertyId: property._id }).lean();

    // Fetch other similar properties based on the same category
    const properties = await PropertyData.find({
      categoryId: property.categoryId,
      _id: { $ne: property._id },  // Exclude the current property
    }).limit(4)
      .populate('categoryId stateId statusId userId')  // Populate similar properties as well
      .lean();

    // Fetch features of the related properties
    for (let prop of properties) {
      const relatedPropertyFeatures = await PropertyDataFeature.find({ propertyId: prop._id })
        .populate('featureId')  // Populate featureId to get feature details
        .lean();
      
      // Add the features to the related property object
      prop.features = relatedPropertyFeatures.map(f => f.featureId.name);
    }

    // Render the property details page
    res.render('property/property-details', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.isLoggedIn,
      path: '/property/property-details',
      property,
      features: featureNames,  // Pass the list of feature names
      images,
      videos,
      properties, 
      companyInfo:companyInfo||[],
      navbar:navbar ||[],
      blogs:blogs ||[], // Pass the related properties with their features
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).send('Server Error');
  }
};

exports.renderSubmitForm = async (req, res) => {
  const PropertyCategory = mongoose.model('PropertyCategory');
  const State = mongoose.model('State');
  const StatusCategory = mongoose.model('StatusCategory');

  const categories = await PropertyCategory.find();
  const states = await State.find();
  const statuses = await StatusCategory.find();
  const features = await PropertyFeature.find();
  const cities = await City.find().populate('stateId');
  const companyInfo = await CompanyInfo.findOne();  
  const navbar = await Navbar.find();  
  const blogs = await Blog.find();
 
  res.render('property/new', {
    pageTitle: 'Real Estate',
    isLoggedIn:req.isLoggedIn  ,
    path: '/property/new',
    categories,
    states,
    statuses,
    features,
    cities,
    companyInfo:companyInfo||[],
navbar:navbar ||[],
blogs:blogs ||[],
  });
};

exports.submitProperty = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).json({ error: 'Please login to submit a property' });
        }

        // Convert termsAndConditions from "on" to true
        const propertyData = new PropertyData({
            ...req.body,
            userId: req.session.user._id,
            image: req.files && req.files.mainImage ? req.files.mainImage[0].filename : null,
            termsAndConditions: req.body.termsAndConditions === 'on' ? true : false
        });

        const savedProperty = await propertyData.save();

        // Handle gallery images if any
        if (req.files && req.files.galleryImages) {
            const galleryImages = req.files.galleryImages.map(file => ({
                image: file.filename,
                propertyId: savedProperty._id
            }));
            await PropertyImages.insertMany(galleryImages);
        }

        // Handle video links
        if (req.body.videoLink && Array.isArray(req.body.videoLink)) {
            const videoLinks = req.body.videoLink
                .filter(link => link && link.trim() !== '') // Filter out empty links
                .map(link => ({
                    video: link,
                    propertyId: savedProperty._id
                }));
            
            if (videoLinks.length > 0) {
                await PropertyVideo.insertMany(videoLinks);
            }
        }

        res.redirect('/property/' + savedProperty._id);
    } catch (error) {
        console.warn('Error saving property:', error);
        res.status(500).json({ error: error.message });
    }
};