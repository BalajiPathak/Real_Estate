const express = require('express');
const router = express.Router();
const userPropertyController = require('../controllers/userProperty');
const multer = require('multer');
const isAuth = require('../middleware/is-auth');
const path = require('path');

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
router.get('/myproperties', userPropertyController.getUserProperties);
router.get('/property/edit/:id', userPropertyController.getEditProperty);
// Update the route to handle multiple file uploads
router.post('/property/:id', upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 5 }
]), userPropertyController.postEditProperty);
router.post('/property/delete/:id', userPropertyController.deleteProperty);

module.exports = router;