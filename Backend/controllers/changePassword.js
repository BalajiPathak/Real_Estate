const bcrypt = require('bcryptjs');
const User = require('../models/user');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');
 
exports.getPassword = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect('/login');
    }
 
    const [companyInfo, navbar, blogs, user] = await Promise.all([
      CompanyInfo.findOne(),
      Navbar.find(),
      Blog.find(),
      User.findById(req.session.userId),
    ]);
 
    if (!user) {
      return res.status(404).render('changePassword/changePassword', {
        pageTitle: 'Real Estate',
        path: '/changePassword',
        errorMessage: 'User not found',
        user: {},
        companyInfo: companyInfo || {},
        navbar: navbar || [],
        blogs: blogs || [],
        isLoggedIn: req.session.isLoggedIn,
      });
    }
 
    res.render('changePassword/changePassword', {
      pageTitle: 'Real Estate',
      path: '/changePassword',
      user,
      companyInfo: companyInfo || {},
      navbar: navbar || [],
      blogs: blogs || [],
      isLoggedIn: req.session.isLoggedIn,
    });
  } catch (err) {
    console.error('Error in getPassword:', err);
    res.status(500).render('changePassword/changePassword', {
      pageTitle: 'Real Estate',
      path: '/changePassword',
      errorMessage: 'An error occurred while fetching your profile',
      user: {},
    });
  }
};
 
exports.postPassword = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect('/login');
    }
 
    const { password, confirmpassword } = req.body;
    console.log('Received Password:', password);
    console.log('Received Confirm Password:', confirmpassword);
 
    function renderError(message) {
      return res.status(422).render('changePassword/changePassword', {
        pageTitle: 'Real Estate',
        path: '/changePassword',
        errorMessage: message,
        user: req.body,
        companyInfo: {},
        navbar: [],
        blogs: [],
        isLoggedIn: req.session.isLoggedIn,
      });
    }
 
    if (!password || !confirmpassword) {
      return renderError('Both password fields are required');
    }
 
    if (password.trim() !== confirmpassword.trim()) {
      console.log('Password mismatch detected');
      return renderError('Passwords do not match');
    }
 
    if (password.length < 6) {
      return renderError('Password must be at least 6 characters long');
    }
 
    const user = await User.findById(req.session.userId);
    if (!user) {
      return renderError('User not found');
    }
 
    const isSamePassword = await bcrypt.compare(password, user.Password);
    if (isSamePassword) {
      return renderError('New password must be different from the current one');
    }
 
    const hashedPassword = await bcrypt.hash(password, 12);
    user.Password = hashedPassword;
    await user.save();
 
    console.log('Password updated successfully');
    return res.redirect('/changePassword'); // You can redirect to a success page if you want
  } catch (err) {
    console.error('Error in postPassword:', err);
    res.status(500).render('changePassword/changePassword', {
      pageTitle: 'Real Estate',
      path: '/changePassword',
      errorMessage: 'An error occurred while updating your password',
      user: req.body,
    });
  }
};