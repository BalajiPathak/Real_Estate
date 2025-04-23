const express = require('express');
const router = express.Router();
const { getHome } = require('../controllers/home');

router.get('/home', getHome);

module.exports = router;