const express = require('express');
const router = express.Router();
const {
    createNavbar,
    getAllNavbars
} = require('../controllers/navbar');

router.post('/navbar', createNavbar);
router.get('/navbar', getAllNavbars);

module.exports = router;