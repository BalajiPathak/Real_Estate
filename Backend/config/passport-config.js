
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');  

// Serialize user into session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: '827877143320-bn74110jsiig5eqijcrhgj80ls9ug3ve.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ googleId: profile.id });
        
        if (existingUser) {
            return done(null, existingUser);  
        }
        const newUser = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value 
        });
        
        await newUser.save(); 
        done(null, newUser);  
    } catch (err) {
        done(err, null);  
    }
}));
