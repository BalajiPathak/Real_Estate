const mongoose = require('mongoose');
const Faqs = require('../models/faqs');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
 
exports.getAllFaqs = async (req, res) => {
  const companyInfo = await CompanyInfo.findOne();
  const navbar = await Navbar.find();
  const blogs = await Blog.find();
          
  const faqs = await Faqs.find();
  console.log(faqs);
  res.render('faqs/faqs', { pageTitle: 'Real Estate', faqs,companyInfo: companyInfo || [],
    navbar: navbar || [],
    blogs: blogs || [], 
  isAgent: req.session.isAgent || false,});
};
 
