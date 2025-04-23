const express = require('express');
const router = express.Router();
const {
    createCompanyInfo,
    getCompanyInfo
} = require('../controllers/companyInfo');

router.post('/company-info', createCompanyInfo);
router.get('/company-info', getCompanyInfo);

module.exports = router;