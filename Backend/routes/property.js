const express = require('express');

const upload= require('../middleware/uploads');
const router = express.Router();
const propertyController = require('../controllers/property');
 
router.get('/', propertyController.getAllProperties);
router.get('/new', propertyController.renderSubmitForm);

router.post('/', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), propertyController.submitProperty);
router.get('/:id', propertyController.getPropertyById);
module.exports = router;
 

