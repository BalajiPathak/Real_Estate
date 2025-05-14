const mongoose = require('mongoose');
 
const PropertyData = require('../models/propertyData');
const { PropertyCategory } = require('../models/propertyCategory');
 
// const { StatusCategory } = require('../models/statusCategory');
const { PropertyFeature } = require('../models/propertyFeature');
const PropertyImages = require('../models/propertyImage');
const { PropertyDataFeature } = require('../models/propertyFeature');
const City = require('../models/city');
const PropertyVideo = require('../models/propertyVideo');  
const State = require('../models/state');
const FilterProperty = require('../models/filterProperty');
const StatusCategory = require('../models/statusCategory');
const crypto = require('crypto');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar')
const Blog = require('../models/blog');
const UserType = require('../models/userType');
 
exports.getAllProperties = async (req, res) => {
  try {
    console.log('Features in query:', req.query);
 
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;
 
    const state = await State.find();
    const propertyFeatures = await PropertyFeature.find();
    const filterProperties = await FilterProperty.find();
    const statusCategory = await StatusCategory.find();
    const companyInfo = await CompanyInfo.findOne();
    const navbar = await Navbar.find();
    const blogs = await Blog.find();
 
    const filters = [];
 
    if (req.query.keyword) {
      filters.push({ name: { $regex: req.query.keyword, $options: 'i' } });
    }
 
    if (req.query.stateId) {
      filters.push({ stateId: req.query.stateId });
    }
 
    if (req.query.stateName) {
      const selectedState = await State.findOne({ name: { $regex: req.query.stateName, $options: 'i' } });
      if (selectedState) {
        filters.push({ stateId: selectedState._id });
      } else {
        filters.push({ _id: null });
      }
    }
 
    if (req.query.statusId) {
      filters.push({ statusId: req.query.statusId });
    }
 
    if (req.query.priceRange) {
      const [minPrice, maxPrice] = req.query.priceRange.split(',').map(Number);
      filters.push({ price: { $gte: minPrice, $lte: maxPrice } });
    }
 
    if (req.query.areaRange) {
      const [minArea, maxArea] = req.query.areaRange.split(',').map(Number);
      filters.push({ area: { $gte: minArea, $lte: maxArea } });
    }
 
    if (req.query.minBeds) {
      filters.push({ beds: { $gte: parseInt(req.query.minBeds) } });
    }
 
    if (req.query.minBaths) {
      filters.push({ baths: { $gte: parseInt(req.query.minBaths) } });
    }
 
    if (req.query.features) {
      const features = Array.isArray(req.query.features) ? req.query.features : req.query.features.split(',');
      console.log('Features after processing:', features);
      const selectedFeatures = await PropertyFeature.find({ name: { $in: features } });
      const selectedFeatureIds = selectedFeatures.map(f => f._id);
      const propertyFeatureMappings = await PropertyDataFeature.find({ featureId: { $in: selectedFeatureIds } });
      const propertyIds = propertyFeatureMappings.map(pf => pf.propertyId);
      if (propertyIds.length > 0) {
        filters.push({ _id: { $in: propertyIds } });
      } else {
        filters.push({ _id: null });
      }
    }
 
    const finalFilter = filters.length > 0 ? { $and: filters } : {};
 
    const totalProperties = await PropertyData.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalProperties / limit);
    const properties = await PropertyData.find(finalFilter)
      .skip(skip)
      .limit(limit);
 
    const selectedFilters = [];
    console.log('selctd features',selectedFilters);
    if (req.query.keyword) selectedFilters.push(`Keyword: "${req.query.keyword}"`);
 
    if (req.query.stateId) {
      const selectedstate = state.find(c => c._id.toString() === req.query.stateId);
      if (selectedstate) selectedFilters.push(`State: ${selectedstate.name}`);
    }
 
    if (req.query.stateName) selectedFilters.push(`State: ${req.query.stateName}`);
 
    if (req.query.statusId) {
      const selectedStatus = statusCategory.find(s => s._id.toString() === req.query.statusId);
      if (selectedStatus) selectedFilters.push(`Status: ${selectedStatus.name}`);
    }
 
    if (req.query.priceRange) {
      const [min, max] = req.query.priceRange.split(',');
      selectedFilters.push(`Price: $${min} to $${max}`);
    }
 
    if (req.query.areaRange) {
      const [min, max] = req.query.areaRange.split(',');
      selectedFilters.push(`Area: ${min} to ${max} sq ft`);
    }
 
    if (req.query.minBeds) selectedFilters.push(`Min Beds: ${req.query.minBeds}`);
    if (req.query.minBaths) selectedFilters.push(`Min Baths: ${req.query.minBaths}`);
 
    if (req.query.features && req.query.features.length > 0) {
      const featuresArray = Array.isArray(req.query.features) ? req.query.features : req.query.features.split(',');
      selectedFilters.push(`Features: ${featuresArray.join(', ')}`);
    }
 
    // Add this before the render call
    const isAgent = req.session?.user?.user_type_id ? 
      (await UserType.findById(req.session.user.user_type_id))?.user_type_name === 'agent' 
      : false;

    res.render('property/property', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session && req.session.isLoggedIn || false,
      isAgent, // Add this line
      properties,
      state,
      propertyFeatures,
      filterProperties,
      currentPage: page,
      totalPages,
      statusCategory,
      keyword: req.query.keyword || '',
      stateId: req.query.stateId || '',
      statusId: req.query.statusId || '',
      priceRange: req.query.priceRange || '',
      areaRange: req.query.areaRange || '',
      minBaths: req.query.minBaths || '',
      maxBaths: req.query.maxBaths || '',
      minBeds: req.query.minBeds || '',
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || [],
      features: req.query.features || [],
      selectedFilters,
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
   
const property = await PropertyData.findById(req.params.id)
.populate([
  { path: 'categoryId' },
  { path: 'stateId' },
  { path: 'statusId' },
  { path: 'userId' },
 
])
.lean();
 
    if (!property) {
      return res.status(404).send('Property not found');
    }
   
   
    const propertyFeatureMappings = await PropertyDataFeature.find({ propertyId: property._id })
      .populate('featureId')
      .lean();
 
    const featureNames = propertyFeatureMappings.map(f => f.featureId?.name || 'Unknown');
 
   
    const images = await PropertyImages.find({ propertyId: property._id }).lean();
    const videos = await PropertyVideo.find({ propertyId: property._id }).lean();
 
   
    const relatedProperties = await PropertyData.find({
      categoryId: property.categoryId,
      _id: { $ne: property._id }
    })
      .limit(4)
      .populate('categoryId stateId statusId userId')
      .lean();
 
   
    for (let related of relatedProperties) {
      const relFeatures = await PropertyDataFeature.find({ propertyId: related._id })
        .populate('featureId')
        .lean();
      related.features = relFeatures.map(f => f.featureId?.name || 'Unknown');
    }
  // console.log('featureNamesfeatureNamesfeatureNames',featureNames)
    res.render('property/property-details', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session?.isLoggedIn || false,
       isAgent: req.session.isAgent || false,
      path: '/property/property-details',
      property,
      features: featureNames,
      images,
      videos,
      properties: relatedProperties,
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || [],
    });
  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).send('Server Error');
  }
};
 
exports.renderSubmitForm = async (req, res) => {
  try {
    if (!req.session.isLoggedIn || !req.session.isAgent ) {
      return res.redirect('/login');
  }
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
    isLoggedIn: req.session && req.session.isLoggedIn || false,  
     isAgent: req.session.isAgent || false,
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
} catch (error) {
  console.warn('Error saving property:', error);
  res.status(500).json({ error: error.message });
}
};
 
exports.submitProperty = async (req, res, next) => {
   
 
  console.log('Session:', req.session);
  console.log('User ID in session:', req.session.userId);
  console.log('Is logged in:', req.session.isLoggedIn);
 
  if (!req.session.isLoggedIn) {
      return res.redirect('/login');
  }
 
  if (!req.session.userId) {
      console.log('User ID missing in session');
      return res.status(401).json({ error: 'User not authenticated' });
  }
 
  const companyInfo = await CompanyInfo.findOne();  
  const navbar = await Navbar.find();  
  const blogs = await Blog.find();
 
 
  try {
    const {
      name,
      price,
      phone,
      description,
      categoryId,
      stateId,
      statusId,
      cityId,
      beds,
      baths,
      area,
      userId,
      termsAndConditions,
      videoLink,
      featureIds
    } = req.body;
 
   
    const mainImage = req.files['mainImage']?.[0]?.filename || 'default.jpg';
    const galleryImages = req.files['galleryImages']?.map((file) => file.filename) || [];
 
   
    let videoLinkString = null;
    if (videoLink && Array.isArray(videoLink)) {
      videoLinkString = videoLink.find(link => link.trim() !== '') || null;
    } else {
      videoLinkString = videoLink?.trim() || null;
    }
 
   
    const newProperty = new PropertyData({
      name,
      price,
      phone,
      description,
      categoryId,
      stateId,
      statusId,
      cityId,
      beds,
      baths,
      area,
      userId: req.session.userId,
      termsAndConditions: termsAndConditions === 'on',
      image: mainImage,
      galleryImages,
      videoLink: videoLinkString,
    });
 
   
    await newProperty.save();
    console.log('Property saved:', newProperty);
 
   
    const propertyId = newProperty._id;
 
   
    const mainImageDoc = new PropertyImages({
      propertyId,
      image: mainImage,
      isMainImage: true,
    });
    await mainImageDoc.save();
 
    for (let image of galleryImages) {
      const galleryImageDoc = new PropertyImages({
        propertyId,
        image,
        isMainImage: false,
      });
      await galleryImageDoc.save();
    }
 
    console.log('Images saved to PropertyImages');
 
   
    if (videoLinkString) {
      const videoDoc = new PropertyVideo({
        propertyId,
        video: videoLinkString,
      });
      await videoDoc.save();
      console.log('Video saved to PropertyVideos');
    }
 
   
    if (featureIds && featureIds.length > 0) {
      for (let featureId of featureIds) {
        const propertyFeature = new PropertyDataFeature({
          propertyId,
          featureId,
        });
        await propertyFeature.save();
      }
      console.log('Features saved to PropertyDataFeature');
    }
 
   
    res.render('property/welcome', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session && req.session.isLoggedIn || false,  
      isAgent: req.session.isAgent || false,
      path: '/property/welcome',
      successMessage:'You have successfully submitted the Property',
      companyInfo:companyInfo||[],
      navbar:navbar ||[],
      blogs:blogs ||[],
    });
  } catch (error) {
    console.error('Error saving property:', error);
    res.status(500).send('Error saving property');
  }
};
