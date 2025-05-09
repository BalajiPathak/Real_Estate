const express = require('express');
const upload= require('../middleware/uploads');
const router = express.Router();

const blogController = require('../controllers/blog');

router.get('/blog', blogController.getAllBlogs);


router.get('/blog/:id', blogController.getBlogDetails);
router.post('/blog/:id', upload.single('commentImage'), blogController.submitComment);


module.exports = router;

