const mongoose = require('mongoose');

const Blog = require('../models/blog');

exports.getAllBlogs = async (req, res) => {

try {
const blogs = await Blog.find();// Fetch all blogs
res.render('blog/blog', {pageTitle: 'Real Estate',
     blogs });
     console.log(blogs);
} catch (error) {
res.status(500).send(error);

}

};


// Controller to get a single blog by ID for the detail view

exports.getBlogDetails = async (req, res) => {
try {

const blog = await Blog.findById(req.params.id);// Find the blog by ID
if (!blog) {
return res.status(404).send('Blog not found');

 }

res.render('blog/blog-details',
    
     {
        pageTitle: 'Real Estate',
         blog });
} catch (error) {
res.status(500).send(error);
}

};