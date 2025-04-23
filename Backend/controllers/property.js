const mongoose = require('mongoose');
const { PropertyData } = require('../models/propertyData');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const {PropertyCategory} = require('../models/propertyCategory');
const {State} = require('../models/state');
const {StatusCategory} = require('../models/statusCategory');
const {PropertyFeature} = require('../models/propertyFeature');
const{PropertyImages}= require('../models/propertyImage');
const{PropertyDataFeature}= require ('../models/propertyFeature');
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
const { PropertyCategory } = require('../models/propertyCategory');
const {State} = require('../models/state');
const {StatusCategory} = require('../models/statusCategory');
const {PropertyFeature} = require('../models/propertyFeature');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes

    exports.getAllProperties= async (req, res) => {
      const properties = await PropertyData.find().populate('categoryId stateId statusId userId').lean();
      const all = await Promise.all(properties.map(async (p) => {
        const features = await PropertyDataFeature.find({ propertyId: p._id }).populate('featureId');
        const images = await PropertyImages.find({ propertyId: p._id });
        return { ...p, features: features.map(f => f.featureId.name), images };
      }));
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      res.render('property', { properties: all });
=======
      res.render('index', { properties: all });
>>>>>>> Stashed changes
=======
      res.render('index', { properties: all });
>>>>>>> Stashed changes
=======
      res.render('index', { properties: all });
>>>>>>> Stashed changes
    },
  
    exports.getPropertyById= async (req, res) => {
      const property = await PropertyData.findById(req.params.id).populate('categoryId stateId statusId userId').lean();
      const features = await PropertyDataFeature.find({ propertyId: property._id }).populate('featureId');
      const images = await PropertyImages.find({ propertyId: property._id });
      res.render('property-details', { property, features: features.map(f => f.featureId.name), images });
    },
  
    exports.renderSubmitForm= async (req, res) => {
      const PropertyCategory = mongoose.model('PropertyCategory');
      const State = mongoose.model('State');
      const StatusCategory = mongoose.model('StatusCategory');
  
      const categories = await PropertyCategory.find();
      const states = await State.find();
      const statuses = await StatusCategory.find();
      const features = await PropertyFeature.find();
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      res.render('property/new',{ 
        pageTitle: 'Real Estate',
         // Changed to match view
       
        isLoggedIn: false,
        path: '/property/new',
        categories, states, statuses, features
    });
    },
  
    exports.submitProperty= async (req, res) => {
      try {
        const {
          name, price, phone, description, categoryId,
          stateId, statusId, beds, baths, area, userId,
          features, termsAndConditions
        } = req.body;
    
        const mainImage = req.files['mainImage']?.[0]?.filename || 'default.jpg';
    
        const property = await PropertyData.create({
          image: mainImage,
          name,
          price,
          phone,
          description,
          categoryId,
          stateId,
          statusId,
          beds,
          baths,
          area,
          userId,
          termsAndConditions: termsAndConditions === 'on'
        });
    
        const featureList = Array.isArray(features) ? features : [features];
        for (let f of featureList) {
          await PropertyDataFeature.create({ propertyId: property._id, featureId: f });
        }
    
        const galleryImages = req.files['galleryImages'] || [];
        for (let img of galleryImages) {
          await PropertyImages.create({ propertyId: property._id, image: img.filename });
        }
    
        res.send('Property submitted successfully!');
      } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
      }
      res.redirect('/property');
    };
    // exports.submitProperty= async (req, res) => {
    //   const {
    //     image, name, price, phone, description,
    //     categoryId, stateId, statusId, beds, baths, area,
    //     userId, features, termsAndConditions
    //   } = req.body;
  
    //   const property = await PropertyData.create({
    //     image,
    //     name,
    //     price,
    //     phone,
    //     description,
    //     categoryId,
    //     stateId,
    //     statusId,
    //     beds,
    //     baths,
    //     area,
    //     userId,
    //     termsAndConditions: termsAndConditions === 'on'
    //   });
  
    //   const featureList = Array.isArray(features) ? features : [features];
    //   for (let f of featureList) {
    //     await PropertyDataFeature.create({ propertyId: property._id, featureId: f });
    //   }
  
    //   await PropertyImages.create({ propertyId: property._id, image:image });
    //   res.render('property/new',{ 
    //     pageTitle: 'Real Estate',
    //      // Changed to match view
       
    //     isLoggedIn: false,
    //     path: '/property/new'
    // });
    //   res.redirect('/property');
    // }
 
=======
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
      res.render('property/new', { categories, states, statuses, features });
    },
  
    exports.submitProperty= async (req, res) => {
      const {
        image, name, price, phone, description,
        categoryId, stateId, statusId, beds, baths, area,
        userId, features, termsAndConditions
      } = req.body;
  
      const property = await PropertyData.create({
        image,
        name,
        price,
        phone,
        description,
        categoryId,
        stateId,
        statusId,
        beds,
        baths,
        area,
        userId,
        termsAndConditions: termsAndConditions === 'on'
      });
  
      const featureList = Array.isArray(features) ? features : [features];
      for (let f of featureList) {
        await PropertyDataFeature.create({ propertyId: property._id, featureId: f });
      }
  
      await PropertyImages.create({ propertyId: property._id, image });
      res.redirect('/property');
    }
 
// exports.getAllProperties = async (req, res) => {
//     const properties = await PropertyData.find()
//         .populate('categoryId')
//         .populate('stateId');
//     res.render('properties3', { properties });
// };

// exports.getPropertyById = async (req, res) => {
//     const property = await PropertyData.findById(req.params.id)
//         .populate('categoryId')
//         .populate('stateId');
//     res.render('property3', { property });
// };

// exports.renderSubmitForm = async (req, res) => {
//     const categories = await PropertyCategory.find();
//     const states = await State.find();
//     res.render('submit-property', { categories, states });
// };

// exports.submitProperty = async (req, res) => {
//     const {
//         name,
//         price,
//         telephone,
//         description,
//         categoryId,
//         stateId,
//         beds,
//         baths,
//         area
//     } = req.body;

//     const newProperty = new PropertyData({
//         name,
//         price,
//         telephone,
//         description,
//         categoryId,
//         stateId,
//         beds,
//         baths,
//         area,
//         termsAndConditions: true
//     });

//     await newProperty.save();
//     res.redirect('/property');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
// };
>>>>>>> Stashed changes
=======
// };
>>>>>>> Stashed changes
=======
// };
>>>>>>> Stashed changes
