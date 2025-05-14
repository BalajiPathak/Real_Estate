const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Check for both session and JWT authentication
    if (!req.session.isLoggedIn && !req.cookies.jwt) {
        req.flash('error', 'Please login to access this page');
        return res.redirect('/login');
    }

    // If user is logged in via session
    if (req.session.isLoggedIn && req.session.user) {
        req.user = req.session.user;
        req.isLoggedIn = true;
        return next();
    }

    // If user has JWT token
    const token = req.cookies.jwt;
    try {
        const decoded = jwt.verify(token, 'your-jwt-secret');
        req.user = decoded;
        req.isLoggedIn = true;
        
        // Sync session with JWT data
        if (!req.session.user) {
            req.session.user = decoded;
            req.session.isLoggedIn = true;
        }
        
        next();
    } catch (err) {
        res.clearCookie('jwt');
        req.flash('error', 'Session expired. Please login again');
        return res.redirect('/login');
    }
};
