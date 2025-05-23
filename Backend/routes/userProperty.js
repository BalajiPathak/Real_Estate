const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { body } = require('express-validator');

const userPropertyController = require('../controllers/userProperty');
const isAuth = require('../middleware/is-auth');
const isAgent = require('../middleware/isAgent');
const City = require('../models/city');

// Multer Configuration for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'property_' + uniqueSuffix + path.extname(file.originalname));
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

// Image Validation Middleware
const validateImages = (req, res, next) => {
    if (req.files) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (req.files.mainImage && req.files.mainImage[0].size > maxSize) {
            return res.status(400).json({ error: 'Main image size should not exceed 5MB' });
        }
        if (req.files.galleryImages) {
            for (let file of req.files.galleryImages) {
                if (file.size > maxSize) {
                    return res.status(400).json({ error: 'Gallery images size should not exceed 5MB each' });
                }
            }
        }
    }
    next();
};

// Property Validations
const propertyValidations = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Property name must be between 3 and 100 characters'),

    body('price')
        .isFloat({ min: 1, max: 999999999 })
        .withMessage('Price must be a valid number between 1 and 999,999,999'),

    body('phone')
        .matches(/^\d{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),

    body('description')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters'),

    body('beds')
        .isInt({ min: 1, max: 20 })
        .withMessage('Number of beds must be between 1 and 20'),

    body('baths')
        .isInt({ min: 1, max: 10 })
        .withMessage('Number of baths must be between 1 and 10'),

    body('area')
        .isFloat({ min: 1, max: 999999 })
        .withMessage('Area must be a valid number between 1 and 999,999'),

    body('videoLink')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (!value) return true;
            const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
            if (!urlPattern.test(value)) {
                throw new Error('Invalid YouTube video URL');
            }
            return true;
        }),

    body('stateId').notEmpty().withMessage('State is required'),
    body('cityId').notEmpty().withMessage('City is required'),
    body('categoryId').notEmpty().withMessage('Category is required'),
    body('statusId').notEmpty().withMessage('Status is required'),

    body('termsAndConditions')
        .toBoolean()
        .isBoolean()
        .equals('true')
        .withMessage('Terms and conditions must be accepted')
];


// -------------------- Routes --------------------

// View user's properties
router.get('/myproperties', isAuth, userPropertyController.getUserProperties);

// Edit property form (GET)
router.get('/property/edit/:id', isAuth, userPropertyController.getEditProperty);

// Handle edit property form (POST)
router.post(
    '/user/property/:id',
    isAuth,
    isAgent,
    upload.fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'galleryImages', maxCount: 5 }
    ]),
    validateImages,
    propertyValidations,
    userPropertyController.postEditProperty
);

// Delete property
router.post('/property/delete/:id', isAuth, userPropertyController.deleteProperty);

// Fetch cities by state ID
router.get('/api/cities/:stateId', async (req, res) => {
    try {
        const cities = await City.find({ stateId: req.params.stateId });
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

module.exports = router;
