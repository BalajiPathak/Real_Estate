const express = require('express');
const upload= require('../middleware/uploads');
const router = express.Router();

const blogController = require('../controllers/blog');

router.get('/', blogController.getAllBlogs);


router.get('/:id', blogController.getBlogDetails);
router.post('/:id',upload.fields([
    { name: 'commentImage', maxCount: 1 }
  ]), blogController.submitComment);


module.exports = router;