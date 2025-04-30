const express = require('express');
const router = express.Router();
const { getHome, getBanners, createBanner, createBannerDetails, postTestimonial } = require('../controllers/home');

router.get('/', getHome);
router.get('/home', getHome);
router.get('/banners', getBanners);
router.post('/banner', createBanner);
router.post('/banner-details', createBannerDetails);
router.post('/testimonial', postTestimonial);

module.exports = router;