

const mongoose = require('mongoose');
const { PropertyData } = require('../models/propertyData');
const {PropertyCategory} = require('../models/propertyCategory');
const {State} = require('../models/state');
const {StatusCategory} = require('../models/statusCategory');
const {PropertyFeature} = require('../models/propertyFeature');
const{PropertyImages}= require('../models/propertyImage');
const{PropertyDataFeature}= require ('../models/propertyFeature');
const City = require('../models/city');

    exports.getAllProperties= async (req, res) => {
      const properties = await PropertyData.find().populate('categoryId stateId statusId userId').lean();
      const all = await Promise.all(properties.map(async (p) => {
        const features = await PropertyDataFeature.find({ propertyId: p._id }).populate('featureId');
        const images = await PropertyImages.find({ propertyId: p._id });
        return { ...p, features: features.map(f => f.featureId.name), images };
      }));

      res.render('property', { properties: all });

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
      const cities = await City.find().populate('stateId');
      
      res.render('property/new',{ 
        pageTitle: 'Real Estate',
         // Changed to match view
       
        isLoggedIn: false,
        path: '/property/new',
        categories, states, statuses, features,cities
    });
    },
  
    
    exports.submitProperty = async (req, res) => {
     
      const mainImage = req.files['mainImage']?.[0]?.filename || 'default.jpg';
      const {
        name,
        price,
        phone,
        description,
        categoryId,
        stateId,
        statusId,
        cities,
        beds,
        baths,
        area,
        userId,
        termsAndConditions
      }=req.body;
  
      const newProperty = new PropertyData({
        image: mainImage,
        name,
        price,
        phone,
        description,
        categoryId,
        stateId,
        statusId,
        cities,
        beds,
        baths,
        area,
        userId,
        termsAndConditions: termsAndConditions === 'on'
      });
  
      await newProperty.save();
      res.redirect('/property');
    }