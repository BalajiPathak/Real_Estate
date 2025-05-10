const express = require('express');
const router = express.Router();
const userprofileController = require('../controllers/userprofile');
const upload = require('../middleware/uploads');
const isAuth = require('../middleware/is-auth');

// Show user profile (GET)
router.get('/userprofile', isAuth, userprofileController.getUserProfile);

// Update user profile (POST with image upload)
router.post('/userprofile', isAuth, upload.single('user_Image'), userprofileController.postUserProfile);

// User type routes
router.post('/usertype', userprofileController.createUserType);
router.get('/usertype', userprofileController.getUserTypes);

module.exports = router;
