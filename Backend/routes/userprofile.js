const express = require('express');
const router = express.Router();
const userprofileController = require('../controllers/userprofile');
const upload = require('../middleware/uploads');

router.get('/userprofile', userprofileController.getUserProfile);
router.post('/userprofile', upload.single('user_Image'), userprofileController.postUserProfile);


module.exports = router;