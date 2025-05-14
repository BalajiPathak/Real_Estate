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
        isAgent: req.session.isAgent || false,
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
      isAgent: req.session.isAgent || false,
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
      isAgent: req.session.isAgent || false,
    });
  }
};

exports.postPassword = async (req, res) => {
  try {
    if (!req.session.isLoggedIn)
       return res.status(401).json
      ({ success: false, message: 'Unauthorized' });

    const { password, confirmpassword } = req.body;

    const user = await User.findById(req.session.userId);

    if (!user) 
      return res.status(404).json(
    { success: false, message: 'User not found' }
  );

    if (!password || !confirmpassword) {
      return res.status(422).json(
        { success: false, message: 'Both password fields are required' }
      );
    }
    if (password !== confirmpassword) {
      return res.status(422).json(
        { success: false, message: 'Passwords do not match' }
      );
    }
    if (password.length < 6) {
      return res.status(422).json(
        { success: false, message: 'Password must be at least 6 characters long' }
      );
    }

    const isSamePassword = await bcrypt.compare(password, user.Password);
    if (isSamePassword) {
      return res.status(422).json(
        { success: false, message: 'New password must be different from the current one' }
      );
    }
     console.log('user of change password',user);

     
    user.Password = await bcrypt.hash(password, 12);
    await user.save();

    //body-parser
    console.log('Text Fields:', req.body); 
    
    return res.json(
      { success: true, message: 'Password updated successfully' }
    );

  } catch (err) {
    console.error('Error in post Password:', err);
    return res.status(500).json(
      { success: false, message: 'An error occurred while updating your password' }
    );
  }
};

