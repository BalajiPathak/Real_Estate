const express = require('express');
const router = express.Router();
const userPropertyController = require('../controllers/userProperty');
const PropertyVideo = require('../models/propertyVideo');
const { PropertyFeature, PropertyDataFeature } = require('../models/propertyFeature');
const { check, body } = require('express-validator');
const multer = require('multer');
const isAuth = require('../middleware/is-auth');
const isAgent=require('../middleware/isAgent');
const City = require('../models/city'); // Add this at the top

// Add this route to fetch cities by state
router.get('/api/cities/:stateId', async (req, res) => {
    try {
        const cities = await City.find({ stateId: req.params.stateId });
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter
});
// Current routes
router.get('/myproperties',isAuth, userPropertyController.getUserProperties);
router.get('/property/edit/:id',isAuth, userPropertyController.getEditProperty);

// Update this route to match the form action
router.post('/user/property/:id', isAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 5 }
]),[ check('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number should contains 10 digits')
   ],isAgent, userPropertyController.postEditProperty);

router.post('/property/delete/:id',isAuth,  userPropertyController.deleteProperty);

module.exports = router;