require('dotenv').config();
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
const userProfileRoutes= require('./routes/userprofile');
const changePasswword= require('./routes/changePassword');

const blogRoutes=require('./routes/blog');
const faqsRoutes= require('./routes/faqs');
const legalRoutes = require('./routes/legal');

const { graphqlHTTP } = require('express-graphql');
const { schema } = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const multer = require('multer');

//socketio
const http = require('http');
const socketIO = require('socket.io');


const app = express();    


//socketio
const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', (socketIO) => {
    console.log('New user connected');
   
  });
   
  app.use((req, res, next) => {
  req.io = io;
    next();
  });
  

  //graphQL

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
const upload = multer({ storage: storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
module.exports = upload;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: true,  
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// Flash messages after passport
app.use(flash());

// Update the session check middleware
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.currentUser = req.session.user || null;
    
    // Add this: Set userId in session if user exists
    if (req.session.user) {
        req.session.userId = req.session.user._id;
    }
    
    next();
});

// Routes should come after all middleware
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
const crypto = require('crypto');
// Add Facebook Strategy import
const FacebookStrategy = require('passport-facebook').Strategy;

app.use(flash());               


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

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
    rootValue: resolvers
  }));
  

  
app.use(homeRoutes); 

app.use(navbarRoutes);
app.use(companyInfoRoutes);
app.use(authRoutes);
app.use(propertyRoutes)

app.use(blogRoutes);
app.use(faqsRoutes);
app.use(userProfileRoutes);
app.use(userPropertyRoutes);
app.use(changePasswword);
app.use(legalRoutes);

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
console.log("vaerified");
//socket 


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
// Facebook Strategy configuration
passport.use(new FacebookStrategy({
    clientID: authConfig.facebook.clientID,
    clientSecret: authConfig.facebook.clientSecret,
    callbackURL: authConfig.facebook.callbackURL,
    profileFields: ['id', 'emails', 'name', 'displayName'],
    enableProof: true,
    state: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if profile and email exist
        if (!profile || !profile.emails || !profile.emails[0]) {
            return done(null, false, { 
                message: 'Email access is required for Facebook login'
            });
        }

        let user = await User.findOne({ 
            $or: [
                { facebookId: profile.id },
                { Email: profile.emails[0].value }
            ]
        });
        
        if (user) {
            // Update existing user if needed
            if (!user.facebookId) {
                user.facebookId = profile.id;
                user.auth_provider = 'facebook';
                if (!user.is_verified) {
                    user.is_verified = true;
                }
                await user.save();
            }
        } else {
            // Create new user
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
        
        return done(null, user);
    } catch (error) {
        console.error('Facebook authentication error:', error);
        return done(error, null);
    }
}));

app.use(errorHandler.handle404);

app.use(errorHandler.handle500);

server.listen(3006,()=>{
    console.log(`Server is running on port 3006 `);
})
// const PORT =3006;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });
// Add this with your other route imports


// Add this with your other route uses (before error handlers)
app.use(legalRoutes);