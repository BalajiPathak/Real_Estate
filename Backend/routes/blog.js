const express = require('express');

const router = express.Router();

const blogController = require('../controllers/blog');

router.get('/', blogController.getAllBlogs);


router.get('/:id', blogController.getBlogDetails);



module.exports = router;