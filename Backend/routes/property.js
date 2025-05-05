const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();
const propertyController = require('../controllers/property');
const upload = require('../middleware/uploads');

// Match the lowercase route from navbar
router.get('/properties', propertyController.getAllProperties);
router.get('/property/new',
    
 propertyController.renderSubmitForm);
router.post('/property', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]),[ check('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number should contains 10 digits')
   ], propertyController.submitProperty);
router.get('/property/:id', propertyController.getPropertyById);
router.get('/welcome',propertyController.submitProperty);
module.exports = router;
 

