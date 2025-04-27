const mongoose = require('mongoose');

const PropertyData = require('../models/propertyData');
const { PropertyCategory } = require('../models/propertyCategory');
const { State } = require('../models/state');
const { StatusCategory } = require('../models/statusCategory');
const { PropertyFeature } = require('../models/propertyFeature');
const PropertyImages = require('../models/propertyImage');
const { PropertyDataFeature } = require('../models/propertyFeature');
const City = require('../models/city');
const PropertyVideo = require('../models/propertyVideo');  // Import PropertyVideo model

const FilterProperty = require('../models/filterProperty'); // Import the FilterProperty model


exports.getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    // Fetch dynamic data for filter options
    const cities = await City.find();
    const propertyFeatures = await PropertyFeature.find();
    const filterProperties = await FilterProperty.find(); // Get all filter properties for sliders

    const filter = {};

    // Apply filters if they exist
    if (req.query.keyword) {
      filter.name = { $regex: req.query.keyword, $options: 'i' }; // Case-insensitive match
    }

    if (req.query.cityId) {
      filter.cityId = req.query.cityId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
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
      filter.baths = { $gte: req.query.minBaths };
    }

    if (req.query.minBeds) {
      filter.beds = { $gte: req.query.minBeds };
    }

    if (req.query.features) {
      filter.features = { $in: req.query.features };
    }

    const totalProperties = await PropertyData.countDocuments(filter);
    const totalPages = Math.ceil(totalProperties / limit);

    const properties = await PropertyData.find(filter)
      .skip(skip)
      .limit(limit);

    // Pass the filter properties for sliders to the view
    res.render('property/property', {
      pageTitle: 'Real Estate',
      properties,
      cities,
      propertyFeatures,
      filterProperties, // Pass filter properties for sliders
      currentPage: page,
      totalPages,
      keyword: req.query.keyword || '',
      cityId: req.query.cityId || '',
      status: req.query.status || '',
      priceRange: req.query.priceRange || '',
      areaRange: req.query.areaRange || '',
      minBaths: req.query.minBaths || '',
      minBeds: req.query.minBeds || '',
      features: req.query.features || [],
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Server Error');
  }
};

exports.getPropertyById = async (req, res) => {
  try {
    const property = await PropertyData.findById(req.params.id)
      .populate('categoryId stateId statusId userId featureId')  // Populate related fields
      
      .lean();

    if (!property) {
      return res.status(404).send('Property not found');
    }

    const features = property.propertyDataFeatures || [];  // If no features, use empty array
    const featureNames = features.map(f => f.featureId.name); // Extract feature names from featureId

    const images = await PropertyImages.find({ propertyId: property._id }).lean();
    const videos = await PropertyVideo.find({ propertyId: property._id }).lean();

    const properties = await PropertyData.find({
      categoryId: property.categoryId,
      _id: { $ne: property._id },
    }).limit(4).lean();

    res.render('property/property-details', {
      pageTitle: 'Real Estate',
      isLoggedIn: false,
      path: '/property/property-details',
      property,
      features: featureNames,  // Pass only the feature names to the view
      images,
      videos,
      properties,
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

  res.render('property/new', {
    pageTitle: 'Real Estate',
    isLoggedIn: false,
    path: '/property/new',
    categories,
    states,
    statuses,
    features,
    cities,
  });
};

exports.submitProperty = async (req, res) => {
  console.log(req.body); // Log the form data to check
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
      videoLink, // Get the video link from form data
    } = req.body;

    const mainImage = req.files['mainImage']?.[0]?.filename || 'default.jpg';
    const galleryImages = req.files['galleryImages']?.map((file) => file.filename) || [];

    console.log('Main Image:', mainImage); // Check the file name for the main image
    console.log('Gallery Images:', galleryImages); // Check the gallery images array

    // Ensure videoLink is a string (use the first valid value from the array if necessary)
    let videoLinkString = null;
    if (videoLink && Array.isArray(videoLink)) {
      // Take the first non-empty value from the array
      videoLinkString = videoLink.find(link => link.trim() !== '') || null;
    } else {
      // If it's already a single string, use it directly
      videoLinkString = videoLink?.trim() || null;
    }

    // Create a new property document
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
      userId,
      termsAndConditions: termsAndConditions === 'on', // terms checkbox
      image: mainImage,
      galleryImages,
      videoLink: videoLinkString, // Store the video link directly in the property document
    });

    // Save the property to the database
    await newProperty.save();
    console.log('Property saved:', newProperty);

    // Now store the image data in PropertyImages collection
    const propertyId = newProperty._id;

    // Save the main image in PropertyImages
    const mainImageDoc = new PropertyImages({
      propertyId,
      image: mainImage,
      isMainImage: true, // Mark this image as the main image
    });
    await mainImageDoc.save();

    // Save the gallery images in PropertyImages
    for (let image of galleryImages) {
      const galleryImageDoc = new PropertyImages({
        propertyId,
        image,
        isMainImage: false, // Mark these images as gallery images
      });
      await galleryImageDoc.save();
    }

    console.log('Images saved to PropertyImages');

    // If a video link is provided, store it in the PropertyVideos collection
    if (videoLinkString) {
      const videoDoc = new PropertyVideo({
        propertyId,
        video: videoLinkString, // Save the validated video link
      });
      await videoDoc.save();
      console.log('Video saved to PropertyVideos');
    }

    // Redirect to property listing after successful save
    res.redirect('/property');
  } catch (error) {
    console.error('Error saving property:', error);
    res.status(500).send('Error saving property');
  }
};
