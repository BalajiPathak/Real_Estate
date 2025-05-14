const mongoose = require('mongoose');
const Blog = require('../models/blog');
const BlogComment = require('../models/blogComment');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');

 
exports.getAllBlogs = async (req, res) => {
  const companyInfo = await CompanyInfo.findOne();
  const navbar = await Navbar.find();
  const blogs = await Blog.find();
  res.render('blog/blog', { pageTitle: 'Real Estate', blogs,  companyInfo: companyInfo || [],
    navbar: navbar || [],
    blogs: blogs || [],
  isAgent: req.session.isAgent || false, });
};
 
exports.getBlogDetails = async (req, res) => {
   const companyInfo = await CompanyInfo.findOne();
          const navbar = await Navbar.find();
          const blogs = await Blog.find();
const blog = await Blog.findById(req.params.id);
  const comments = await BlogComment.find({ BlogId: blog._id });
  res.render('blog/blog-details', {
    pageTitle: 'Real Estate',
    blog,
    comments,
    companyInfo: companyInfo || [],
    navbar: navbar || [],
    blogs: blogs || [],
    isAgent: req.session.isAgent || false,
  });
};
exports.submitComment = async (req, res) => {
  try {
    const { name, BlogId, Comment } = req.body;
    const Img = req.file ? req.file.filename : 'default.jpg';
    const newComment = new BlogComment({
      name,
      BlogId,
      Comment,
      Img
    });
 
    await newComment.save();
 
    
     req.io.emit('broadcastComment', {
      name,
      Comment,
      Img,
      BlogId
    });
 
    res.redirect('/blog/' + BlogId);
  } catch (err) {
    console.error(err);
    res.status(500).send('Comment could not be saved.');
  }
};
// exports.submitComment = async (req, res) => {
//   try {
//     const { name, BlogId, Comment } = req.body;
//     console.log("hello");
//     const Img = req.files['commentImage']?.[0]?.filename || 'default.jpg';
//     const newComment = new BlogComment({
//       name,
//       BlogId,
//       Comment,
//       Img:Img
//     });
 
//     await newComment.save();
//     res.redirect('/blog/' + BlogId);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Comment could not be saved.');
//   }
// };