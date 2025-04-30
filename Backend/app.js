const express = require('express');
// Add flash import
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const isAuth = require('./middleware/is-auth')
const navbarRoutes = require('./routes/navbar');
const companyInfoRoutes = require('./routes/companyInfo');
const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authConfig = require('./config/auth.config');
const User =require('./models/user');
// Add these imports at the top
const propertyRoutes = require('./routes/property');
const userPropertyRoutes = require('./routes/userProperty');


const blogRoutes=require('./routes/blog');
const faqsRoutes= require('./routes/faqs');

const multer = require('multer');


const app = express();          
// Add after other middleware configurations
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create multer instance
const upload = multer({ storage: storage });

// Make uploads directory accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Export upload for use in routes
module.exports = upload;
// Add after other app.use() statements
// Move this before any route declarations
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add this middleware to make user data available globally
app.use((req, res, next) => {
    res.locals.isLoggedIn = !!req.session.user;
    res.locals.currentUser = req.session.user;
    next();
});

// Your routes should come after these middlewares
app.use('/', propertyRoutes);

// Add this to handle file uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
const crypto = require('crypto');
// Add Facebook Strategy import
const FacebookStrategy = require('passport-facebook').Strategy;



app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add flash middleware after session middleware
app.use(flash());               

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// Specific package routes
app.use('/slick', express.static(path.join(__dirname, 'node_modules/slick-carousel/slick')));
app.use('/lightbox', express.static(path.join(__dirname, 'node_modules/lightbox2/dist')));
app.use('/jquery-ui', express.static(path.join(__dirname, 'node_modules/jquery-ui/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use('/font-awesome', express.static(path.join(__dirname, 'node_modules/font-awesome'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));
app.use('/jquery', express.static(path.join(__dirname, 'node_modules/jquery/dist')));
app.use('/font-awesome', express.static(path.join(__dirname, 'node_modules/font-awesome')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect('mongodb+srv://balajipathak:pUo5vnHtW84bZTej@cluster0.himqpss.mongodb.net/realEstate', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use(homeRoutes); 

app.use(navbarRoutes);
app.use(companyInfoRoutes);
app.use(authRoutes);
app.use(propertyRoutes)

app.use(blogRoutes);
app.use(faqsRoutes);
app.use(isAuth,userPropertyRoutes);

app.use(errorHandler.handle404);

app.use(errorHandler.handle500);

const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;
    
    if (!token) {
        return next();
    }

    jwt.verify(token, 'your-jwt-secret', (err, user) => {
        if (err) {
            return next();
        }
        req.user = user;
        next();
    });
};

app.use(authenticateToken);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: authConfig.google.clientID,
    clientSecret: authConfig.google.clientSecret,
    callbackURL: authConfig.google.callbackURL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ Email: profile.emails[0].value });
        
        if (!user) {
            user = new User({
                First_Name: profile.name.givenName,
                Last_Name: profile.name.familyName,
                Email: profile.emails[0].value,
                Password: crypto.randomBytes(16).toString('hex'),
                googleId: profile.id,
                auth_provider: 'google',
                is_verified: true // Google users are already verified
            });
            await user.save();
        } else if (!user.googleId) {
            // If user exists but doesn't have googleId (registered via email)
            user.googleId = profile.id;
            user.auth_provider = 'google';
            await user.save();
        }
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// After Google Strategy, add Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: authConfig.facebook.clientID,
    clientSecret: authConfig.facebook.clientSecret,
    callbackURL: authConfig.facebook.callbackURL,
    profileFields: authConfig.facebook.profileFields
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // First check if user exists with Facebook ID
        let user = await User.findOne({ facebookId: profile.id });
        
        // If no user found with Facebook ID, check email
        if (!user && profile.emails && profile.emails[0]) {
            user = await User.findOne({ Email: profile.emails[0].value });
            
            if (user) {
                // If user exists with email but has Google auth
                if (user.googleId) {
                    return done(null, false, { 
                        message: 'This email is already registered with Google. Please use Google Sign In.'
                    });
                }
                
                // Update existing user with Facebook ID
                user.facebookId = profile.id;
                user.auth_provider = 'facebook';
                await user.save();
            } else {
                // Create new user if doesn't exist
                user = new User({
                    First_Name: profile.name.givenName || profile.displayName.split(' ')[0],
                    Last_Name: profile.name.familyName || profile.displayName.split(' ')[1] || '',
                    Email: profile.emails[0].value,
                    Password: crypto.randomBytes(16).toString('hex'),
                    facebookId: profile.id,
                    auth_provider: 'facebook',
                    is_verified: true
                });
                await user.save();
            }
        }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

app.use(errorHandler.handle404);

app.use(errorHandler.handle500);


app.use(authenticateToken);

// Register models
// require('./models/propertyCategory');
// require('./models/state');
// require('./models/statusCategory');
// require('./models/propertyData');

const PORT =3006;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});