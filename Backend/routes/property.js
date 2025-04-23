const express = require('express');
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
const upload= require('../middleware/uploads');
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
const router = express.Router();
const propertyController = require('../controllers/property');
 
router.get('/', propertyController.getAllProperties);
router.get('/new', propertyController.renderSubmitForm);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
router.post('/property/', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 }
  ]), propertyController.submitProperty);
router.get('/:id', propertyController.getPropertyById);
=======
router.post('/', propertyController.submitProperty);
router.get('/:id', propertyController.getPropertyById);
 
>>>>>>> Stashed changes
=======
router.post('/', propertyController.submitProperty);
router.get('/:id', propertyController.getPropertyById);
 
>>>>>>> Stashed changes
=======
router.post('/', propertyController.submitProperty);
router.get('/:id', propertyController.getPropertyById);
 
>>>>>>> Stashed changes
module.exports = router;
 