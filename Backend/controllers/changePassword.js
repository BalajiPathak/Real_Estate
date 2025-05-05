const bcrypt = require('bcryptjs');
const User = require('../models/user');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

exports.getPassword = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) return res.redirect('/login');

    const [companyInfo, navbar, blogs, user] = await Promise.all([
      CompanyInfo.findOne(),
      Navbar.find(),
      Blog.find(),
      User.findById(req.session.userId),
    ]);

    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    if (!user) {
      return res.status(404).render('changePassword/changePassword', {
        pageTitle: 'Real Estate',
        path: '/changePassword',
        errorMessage: 'User not found',
        successMessage: null,
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
      errorMessage: null,
      successMessage,
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
      successMessage: null,
      user: {},
      companyInfo: {},
      navbar: [],
      blogs: [],
      isLoggedIn: req.session.isLoggedIn,
    });
  }
};

exports.postPassword = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) return res.redirect('/login');

    const { password, confirmpassword } = req.body;

    const [companyInfo, navbar, blogs, user] = await Promise.all([
      CompanyInfo.findOne(),
      Navbar.find(),
      Blog.find(),
      User.findById(req.session.userId),
    ]);

    function renderError(message) {
      return res.status(422).render('changePassword/changePassword', {
        pageTitle: 'Real Estate',
        path: '/changePassword',
        errorMessage: message,
        successMessage: null,
        user: user || {},
        companyInfo: companyInfo || {},
        navbar: navbar || [],
        blogs: blogs || [],
        isLoggedIn: req.session.isLoggedIn,
      });
    }

    if (!password || !confirmpassword) {
      return renderError('Both password fields are required');
    }

    if (password.trim() !== confirmpassword.trim()) {
      return renderError('Passwords do not match');
    }

    if (password.length < 6) {
      return renderError('Password must be at least 6 characters long');
    }

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

    req.session.successMessage = 'Password updated successfully';
    return res.redirect('/changePassword');
  } catch (err) {
    console.error('Error in postPassword:', err);
    res.status(500).render('changePassword/changePassword', {
      pageTitle: 'Real Estate',
      path: '/changePassword',
      errorMessage: 'An error occurred while updating your password',
      successMessage: null,
      user: {},
      companyInfo: {},
      navbar: [],
      blogs: [],
      isLoggedIn: req.session.isLoggedIn,
    });
  }
};