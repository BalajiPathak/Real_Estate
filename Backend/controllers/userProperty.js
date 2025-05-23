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
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


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

        if (!property) return res.redirect('/myproperties');

        const [cities, states, propertyFeatures, propertyVideos, propertyImages, allFeatures, companyInfo, navbars, categories, statuses, blogs] = await Promise.all([
            City.find({ stateId: property.stateId._id }),
            State.find(),
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

        const selectedFeatureIds = propertyFeatures.map(f => f.featureId.toString());
        const videoLinks = propertyVideos.map(v => v.video); // For prefill in form

        const galleryImages = propertyImages.length
            ? propertyImages.map(img => '/uploads/' + img.image)
            : ['/uploads/nothing'];

        res.render('property/edit', {
            pageTitle: 'Edit Property',
            path: '/myproperties',
            property,
            galleryImages,
            videoLinks,
            selectedFeatureIds,
            features: allFeatures,
            states,
            cities,
            categories,
            statuses,
            companyInfo: companyInfo || {},
            navbar: navbars || [],
            blogs: blogs || [],
            uploadsPath: '/uploads/',
            user: req.user,
            isLoggedIn: req.session.isLoggedIn,
            isAgent: req.session.isAgent
        });
    } catch (err) {
        console.error(err);
        res.redirect('/myproperties');
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

// Add sharp to the imports at the top
exports.postEditProperty = async (req, res) => {
  const propertyId = req.params.id;
  const errors = validationResult(req);

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    console.log("mongodb me error hai ");
    
    return res.status(400).redirect(`/property/edit/${propertyId}`);
  }

  try {
    const existingProperty = await Property.findById(propertyId);
    if (!existingProperty) {
    console.log("existing propertuy nhi mil rhsa hai  ");

      return res.status(404).redirect(`/property/edit/${propertyId}`);
    }

    if (!errors.isEmpty()) {
      // Re-fetch data and re-render on validation error
      const [cities, states, propertyFeatures, propertyVideos, propertyImages, allFeatures, companyInfo, navbars, categories, statuses, blogs] = await Promise.all([
        City.find({ stateId: existingProperty.stateId }),
        State.find(),
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

      const selectedFeatureIds = propertyFeatures.map(f => f.featureId.toString());
      const videoLinks = propertyVideos.map(v => v.video);
      const galleryImages = propertyImages.length ? propertyImages.map(img => '/uploads/' + img.image) : ['/uploads/nothing'];

      return res.render('property/edit', {
        pageTitle: 'Edit Property',
        path: '/myproperties',
        property: existingProperty,
        errorMessage: errors.array()[0].msg,
        galleryImages,
        videoLinks,
        selectedFeatureIds,
        features: allFeatures,
        states,
        cities,
        categories,
        statuses,
        companyInfo: companyInfo || {},
        navbar: navbars || [],
        blogs: blogs || [],
        uploadsPath: '/uploads/',
        user: req.user,
        isLoggedIn: req.session.isLoggedIn,
        isAgent: req.session.isAgent
      });
    }

    // Update basic fields
    Object.assign(existingProperty, {
      name: req.body.name,
      price: req.body.price,
      phone: req.body.phone,
      description: req.body.description,
      beds: req.body.beds,
      baths: req.body.baths,
      area: req.body.area,
      stateId: req.body.stateId,
      cityId: req.body.cityId,
      categoryId: req.body.categoryId,
      statusId: req.body.statusId
    });

    // HANDLE CROPPED MAIN IMAGE (Base64)
    if (req.body.croppedImage) {
      const base64Data = req.body.croppedImage.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `cropped-main-${Date.now()}.jpg`;
      const filepath = path.join(__dirname, '../uploads', filename);

      await sharp(buffer).resize(800, 600).jpeg({ quality: 90 }).toFile(filepath);

      // Delete old main image if exists
      if (existingProperty.mainImage) {
        const oldMainPath = path.join(__dirname, '..', existingProperty.mainImage);
        try { await fs.unlink(oldMainPath); } catch (e) {}
      }

      existingProperty.mainImage = `uploads/${filename}`;
    } else if (req.files?.mainImage?.[0]) {
      const mainImg = req.files.mainImage[0];
      const filename = `main-${Date.now()}-${mainImg.originalname}`;
      const filepath = path.join(__dirname, '../uploads', filename);

      await sharp(mainImg.path).resize(800, 600).jpeg({ quality: 90 }).toFile(filepath);
      existingProperty.mainImage = `uploads/${filename}`;
    }

    // HANDLE NEW GALLERY IMAGES (keep existing + append new)
    if (req.files?.galleryImages?.length > 0) {
      for (const file of req.files.galleryImages) {
        const filename = `gallery-${Date.now()}-${file.originalname}`;
        const filepath = path.join(__dirname, '../uploads', filename);
        await sharp(file.path).resize(800, 600).jpeg({ quality: 90 }).toFile(filepath);

        await PropertyImage.create({ propertyId, image: filename });
      }
    }

    // HANDLE EXISTING GALLERY DELETION (if you support it via checkboxes, e.g. req.body.deleteImages)
    if (req.body.deleteImages) {
      const deleteList = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
      for (const imgId of deleteList) {
        const img = await PropertyImage.findById(imgId);
        if (img) {
          const imgPath = path.join(__dirname, '../uploads', img.image);
          try { await fs.unlink(imgPath); } catch (e) {}
          await img.remove();
        }
      }
    }

    await existingProperty.save();

    // HANDLE VIDEOS
    await PropertyVideo.deleteMany({ propertyId });
    const videoArray = Array.isArray(req.body.videoLink) ? req.body.videoLink : [req.body.videoLink];
    for (const link of videoArray) {
      if (link?.trim()) {
        await PropertyVideo.create({ propertyId, video: link.trim() });
      }
    }

    // HANDLE FEATURES
    await PropertyDataFeature.deleteMany({ propertyId });
    const featuresArray = Array.isArray(req.body.features) ? req.body.features : [req.body.features];
    for (const featureId of featuresArray) {
      if (mongoose.Types.ObjectId.isValid(featureId)) {
        await PropertyDataFeature.create({ propertyId, featureId });
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

