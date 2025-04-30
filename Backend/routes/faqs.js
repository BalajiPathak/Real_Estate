const express = require('express');

const router = express.Router();

const faqsController = require('../controllers/faqs');

router.get('/faqs', faqsController.getAllFaqs);



module.exports = router;