const express = require('express');
const router = express.Router();
const changePasswordController = require('../controllers/changePassword');


router.get('/changePassword', changePasswordController.getPassword);
router.post('/changePassword', changePasswordController.postPassword);


module.exports = router;