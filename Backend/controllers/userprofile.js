const mongoose = require('mongoose');
const User = require('../models/user');
const UserType = require('../models/userType');
const bcrypt = require('bcryptjs');
const CompanyInfo = require('../models/companyInfo');
const Navbar = require('../models/navbar');
const Blog = require('../models/blog');

exports.getUserProfile = async (req, res) => {
    try {
        if (!req.session.isLoggedIn) {
            return res.redirect('/login');  
        }

        const companyInfo = await CompanyInfo.findOne();
        const navbar = await Navbar.find();
        const blogs = await Blog.find();
        
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).render('userprofile/userprofile', {
                pageTitle: 'Real Estate',
                path: 'userprofile/userprofile',
                errorMessage: 'User not found',
                user: {},
                companyInfo: companyInfo || {},
                navbar: navbar || [],
                blogs: blogs || [],
                isLoggedIn: req.session.isLoggedIn,
                 isAgent: req.session.isAgent || false,
            });
        }

        res.render('userprofile/userprofile', {
            pageTitle: 'Real Estate',
            path: 'userprofile/userprofile',
            user,
            companyInfo: companyInfo || {}, 
            navbar: navbar || [],
            blogs: blogs || [],
            isLoggedIn: req.session.isLoggedIn,
             isAgent: req.session.isAgent || false,
        });
    } catch (err) {
        console.error('Error in getUserProfile:', err);
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
        console.log('Form Data:', req.body); 
        console.log('File Upload:', req.file);  
        if (!req.session.isLoggedIn || !req.session.isAgent ) {
            return res.redirect('/login');
        }

        const { First_Name, Last_Name, Email, Password, confirmPassword, Facebook, Twitter, Website, Public_email, Phone, FAX } = req.body;
        console.log('Session User ID:', req.session.userId);
        const existingUser = await User.findById(req.session.userId);
        if (!existingUser) {
            return res.status(404).render('userprofile/userprofile', {
                pageTitle: 'Real Estate',
                path: 'userprofile/userprofile',
                errorMessage: 'User not found',
                user: req.body
            });
        }
        if (Password !== confirmPassword) {
            return res.status(422).render('userprofile/userprofile', {
                pageTitle: 'Real Estate',
                path: 'userprofile/userprofile',
                errorMessage: 'Passwords do not match',
                user: req.body
            });
        }

        // Handle image upload
        let user_image = req.file ? req.file.filename : existingUser.user_image;

        // Hash password if changed
        let hashedPassword = existingUser.Password;
        if (Password && Password !== existingUser.Password) {
            hashedPassword = await bcrypt.hash(Password, 12);
        }

        // Log before updating the user
        console.log('Updating User:', {
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

        // Update user data
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            {
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
            },
            { new: true }
        );

        // Log after the update
        console.log('Updated User:', updatedUser);

        res.redirect('/userprofile');
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).render('userprofile/userprofile', {
            pageTitle: 'Real Estate',
            path: 'userprofile/userprofile',
            errorMessage: 'An error occurred while updating your profile',
            user: req.body
        });
    }
};

// Add these new controller methods
exports.createUserType = async (req, res) => {
    try {
        const { user_type_name } = req.body;

        if (!user_type_name) {
            return res.status(400).json({
                success: false,
                message: 'User type name is required'
            });
        }

        // Check if user type already exists
        const existingUserType = await UserType.findOne({ user_type_name });
        if (existingUserType) {
            return res.status(400).json({
                success: false,
                message: 'User type already exists'
            });
        }

        // Create new user type
        const userType = new UserType({
            user_type_name
        });

        await userType.save();

        res.status(201).json({
            success: true,
            message: 'User type created successfully',
            data: userType
        });

    } catch (error) {
        console.error('Error creating user type:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user type',
            error: error.message
        });
    }
};

exports.getUserTypes = async (req, res) => {
    try {
        const userTypes = await UserType.find();
        
        res.status(200).json({
            success: true,
            data: userTypes
        });

    } catch (error) {
        console.error('Error fetching user types:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user types',
            error: error.message
        });
    }
};
