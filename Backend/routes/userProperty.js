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
// Current routes
router.get('/myproperties',isAuth, userPropertyController.getUserProperties);
router.get('/property/edit/:id',isAuth, userPropertyController.getEditProperty);

// Update this route to match the form action
router.post('/user/property/:id', isAuth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 5 }
]), userPropertyController.postEditProperty);

router.post('/property/delete/:id',isAuth,  userPropertyController.deleteProperty);

module.exports = router;