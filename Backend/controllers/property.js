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
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;



exports.getAllProperties = async (req, res) => {
  try {
    console.log('Features in query:', req.query);

    const isLoggedIn = req.session && req.session.isLoggedIn || false;
    const isAgent = isLoggedIn && req.session.user?.user_type_id
      ? (await UserType.findById(req.session.user.user_type_id))?.user_type_name === 'agent'
      : false;

    const page = parseInt(req.query.page) || 1;
    const limit = isLoggedIn || isAgent ? 12 : 8;
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
    filters.push({ saleStatus: { $ne: 'sold' } });


    const finalFilter = filters.length > 0 ? { $and: filters } : {};

    const totalProperties = await PropertyData.countDocuments(finalFilter);
    const totalPages = Math.ceil(totalProperties / limit);

    // Get the list of properties based on filters
    const properties = await PropertyData.find(finalFilter)
      .populate('categoryId stateId statusId cityId')
      .skip(skip)
      .limit(limit);

    const propertiesWithStatus = properties.map(property => ({
      ...property.toObject(),
      saleStatus: property.saleStatus || 'available'
    }));

    const disablePagination = !(isLoggedIn || isAgent);
    const selectedFilters = [];

    // Include filters in the response (optional)
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

    res.render('property/property', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session && req.session.isLoggedIn || false,
      isAgent,
      properties: propertiesWithStatus,
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
      disablePagination
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Server Error');
  }
};


async function ensureUploadsDirectory() {
  const uploadsPath = path.join(__dirname, '../uploads');
  try {
    await fs.access(uploadsPath);
  } catch (error) {
    await fs.mkdir(uploadsPath, { recursive: true });
  }
}

// Modify getPropertyById to use correct path
exports.getPropertyById = async (req, res) => {
  try {
    // Special case for logo.png from CompanyInfo
    if (req.params.id === 'logo.png') {
      const companyInfo = await CompanyInfo.findOne();
      if (companyInfo && companyInfo.Logo) {
        return res.sendFile(path.join(__dirname, '../uploads', companyInfo.Logo));
      }
    }

    // First validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Not Found',
        isLoggedIn: req.session?.isLoggedIn || false,
        isAgent: req.session?.isAgent || false,
        companyInfo: await CompanyInfo.findOne() || [],
        navbar: await Navbar.find() || [],
        blogs: await Blog.find() || []
      });
    }

    const [companyInfo, navbar, blogs, property] = await Promise.all([
      CompanyInfo.findOne(),
      Navbar.find(),
      Blog.find(),
      PropertyData.findById(req.params.id)
        .populate([
          { path: 'categoryId' },
          { path: 'stateId' },
          { path: 'statusId' },
          { path: 'userId' }
        ])
        .lean()
    ]);

    if (!property) {
      return res.status(404).render('pages/404', {
        pageTitle: 'Not Found',
        isLoggedIn: req.session?.isLoggedIn || false,
        isAgent: req.session?.isAgent || false,
        error: 'Property not found',
        companyInfo: companyInfo || [],
        navbar: navbar || [],
        blogs: blogs || []
      });
    }

    const [propertyFeatureMappings, images, videos] = await Promise.all([
      PropertyDataFeature.find({ propertyId: property._id })
        .populate('featureId')
        .lean(),
      PropertyImages.find({ propertyId: property._id }).lean(),
      PropertyVideo.find({ propertyId: property._id }).lean()
    ]);

    const featureNames = propertyFeatureMappings.map(f => f.featureId?.name || 'Unknown');

    // Get related properties
    let relatedProperties = [];
    if (property.categoryId) {
      relatedProperties = await PropertyData.find({
        categoryId: property.categoryId,
        _id: { $ne: property._id }
      })
        .limit(4)
        .populate('categoryId stateId statusId userId cityId')
        .lean();

      // Get features for related properties
      await Promise.all(relatedProperties.map(async (related) => {
        const relFeatures = await PropertyDataFeature.find({ propertyId: related._id })
          .populate('featureId')
          .lean();
        related.features = relFeatures.map(f => f.featureId?.name || 'Unknown');
      }));
    }

    res.render('property/property-details', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session?.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
      path: '/property/property-details',
      property,
      features: featureNames,
      images,
      videos,
      properties: relatedProperties,
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || []
    });

  } catch (error) {
    console.error('Error fetching property details:', error);
    res.status(500).render('pages/500', {
      pageTitle: 'Error',
      isLoggedIn: req.session?.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
      companyInfo: await CompanyInfo.findOne() || [],
      navbar: await Navbar.find() || [],
      blogs: await Blog.find() || []
    });
  }
};

exports.renderSubmitForm = async (req, res) => {
  try {
    if (!req.session.isLoggedIn || !req.session.isAgent) {
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
      companyInfo: companyInfo || [],
      navbar: navbar || [],
      blogs: blogs || [],
    });
  } catch (error) {
    console.warn('Error saving property:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitProperty = async (req, res, next) => {
  try {
    // Ensure uploads directory exists
    await ensureUploadsDirectory();

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
      termsAndConditions,
      videoLink,
      featureIds
    } = req.body;

    // Validate required fields
    if (!name || !price || !categoryId || !stateId || !statusId || !cityId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate city belongs to state
    const cityExists = await City.findOne({
      _id: cityId,
      stateId: stateId
    });

    if (!cityExists) {
      return res.status(400).json({ error: 'Selected city does not belong to the selected state' });
    }

    // Process cropped main image
    let mainImage = 'default.jpg';
    if (req.body.croppedImage) {
      const base64Data = req.body.croppedImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const filename = `property_${Date.now()}.jpg`;
      const filepath = path.join(__dirname, '../uploads', filename);

      await sharp(buffer)
        .jpeg({ quality: 90 })
        .toFile(filepath);

      mainImage = filename;
    } else if (req.files?.['mainImage']?.[0]?.filename) {
      mainImage = req.files['mainImage'][0].filename;
    }

    // Process gallery images
    const galleryImages = [];
    if (req.files?.['galleryImages']) {
      for (const file of req.files['galleryImages']) {
        try {
          const filename = `gallery_${Date.now()}_${file.originalname}`;
          const filepath = path.join(__dirname, '../uploads', filename);

          // Check if buffer exists
          if (!file.buffer) {
            console.error('No buffer found in file:', file);
            continue;
          }

          await sharp(file.buffer)
            .resize(800, 600, { fit: 'inside' })
            .toFormat('jpeg')
            .jpeg({ quality: 85 })
            .toFile(filepath);

          galleryImages.push(filename);
        } catch (err) {
          console.error('Error processing gallery image:', err);
          continue;
        }
      }
    }

    // Create new property
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
      saleStatus: 'available'
    });

    await newProperty.save();

    // Save operations array
    const saveOperations = [
      // Save main image
      new PropertyImages({
        propertyId: newProperty._id,
        image: mainImage,
        isMainImage: true
      }).save(),

      // Save gallery images
      ...galleryImages.map(image =>
        new PropertyImages({
          propertyId: newProperty._id,
          image,
          isMainImage: false
        }).save())
    ];

    // Add video link if valid
    if (videoLink && typeof videoLink === 'string') {
      saveOperations.push(
        new PropertyVideo({
          propertyId: newProperty._id,
          video: videoLink.trim()
        }).save()
      );
    }

    // Add features
    if (Array.isArray(featureIds) && featureIds.length > 0) {
      saveOperations.push(
        ...featureIds.map(featureId =>
          new PropertyDataFeature({
            propertyId: newProperty._id,
            featureId
          }).save()
        )
      );
    }

    // Wait for all operations
    await Promise.all(saveOperations);

    // Redirect to success page
    const companyInfo = await CompanyInfo.findOne() || {};
    const navbar = await Navbar.find() || [];
    const blogs = await Blog.find() || [];

    return res.render('property/welcome', {
      pageTitle: 'Real Estate',
      isLoggedIn: req.session?.isLoggedIn || false,
      path: '/property/welcome',
      successMessage: 'You have successfully submitted the Property',
      companyInfo,
      navbar,
      blogs
    });


  } catch (error) {
    console.error('Error saving property:', error);

    return res.status(500).render('pages/500', {
      pageTitle: 'Error',
      isLoggedIn: req.session?.isLoggedIn || false,
      isAgent: req.session?.isAgent || false,
      error: 'Failed to submit property',
      companyInfo: await CompanyInfo.findOne() || {},
      navbar: await Navbar.find() || [],
      blogs: await Blog.find() || []
    });
  }
};

