const express = require('express');
const router = express.Router();
const userprofileController = require('../controllers/userprofile');
const upload = require('../middleware/uploads');
const isAuth = require('../middleware/is-auth');

router.get('/userprofile',isAuth, userprofileController.getUserProfile);
router.post('/userprofile', upload.single('user_Image'), userprofileController.postUserProfile);


module.exports = router;