const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/property');
const upload = require('../middleware/uploads');

// Match the lowercase route from navbar
router.get('/properties', propertyController.getAllProperties);
router.get('/property/new', propertyController.renderSubmitForm);
router.post('/property', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
]), propertyController.submitProperty);
router.get('/property/:id', propertyController.getPropertyById);

module.exports = router;
 

