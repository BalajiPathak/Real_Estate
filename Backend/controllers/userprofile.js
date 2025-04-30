const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

exports.getUserProfile = async (req, res) => {
    try {
        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        if (!req.session.isLoggedIn) {
            return res.redirect('/login'); // Ensure the user is logged in
        }

        // Fetch the user profile based on logged in user session
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).render('userprofile/userprofile', {
                pageTitle: 'Real Estate',
                path: 'userprofile/userprofile',
                errorMessage: 'User not found',
                user: {} // Empty object to avoid errors in EJS
            });
        }


        res.render('userprofile/userprofile', {
            pageTitle: 'Real Estate',
            path: 'userprofile/userprofile',
            user,
            companyInfo: companyInfo || [],
            navbar: navbar || [],
            blogs: blogs || [],
            isLoggedIn: req.session.isLoggedIn
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('userprofile/userprofile', {
            pageTitle: 'Real Estate',
            path: 'user/userprofile',
            errorMessage: 'An error occurred while fetching your profile',
            user: {}
        });
    }
};

exports.postUserProfile = async (req, res) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.redirect('/login'); // Ensure the user is logged in
        }

        const { First_Name, Last_Name,Email, Password, confirmPassword, Facebook, Twitter,Website,  Public_email, Phone, FAX } = req.body;
        const user_image = req.files['userImage']?.[0]?.filename || 'default.jpg';
        // Check if passwords match
        if (Password !== confirmPassword) {
            return res.status(422).render('userprofile/userprofile', {
                pageTitle: 'Real Estate',
                path: 'userprofile/userprofile',
                errorMessage: 'Passwords do not match',
                user: req.body
            });
        }

        // Hash the new password if provided
        let hashedPassword = req.user.Password;
        if (Password) {
            hashedPassword = await bcrypt.hash(Password, 12);
        }

        // Update the user profile in the database
        const newUser= await User.findByIdAndUpdate(req.session.userId, {
            First_Name,
            Last_Name,
            Email,
            Password: hashedPassword,
            Facebook,
            Twitter,
            Website,
            Public_email,
            Phone,
            FAX,
            user_image
        });
        await newUser.save();
        // Redirect back to the profile page with updated data
        res.redirect('userprofile/userprofile');
    } catch (err) {
        console.error(err);
        res.status(500).render('userprofile/userprofile', {
            pageTitle: 'Real Estate',
            path: 'userprofile/userprofile',
            errorMessage: 'An error occurred while updating your profile',
            user: req.body
        });
    }
};
