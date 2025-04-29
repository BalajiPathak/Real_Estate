const express = require('express');
const router = express.Router();
const { getHome, createBanner, createBannerDetails, getBanners } = require('../controllers/home');

router.get('/home', getHome);
router.get('/banners', getBanners);
router.post('/banner', createBanner);
router.post('/banner-details', createBannerDetails);

module.exports = router;