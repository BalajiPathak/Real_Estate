const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        // Check for session authentication if JWT is not present
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }
        // If session exists, set user and continue
        req.user = req.session.user;
        req.isLoggedIn = true;
        return next();
    }

    try {
        const decoded = jwt.verify(token, 'your-jwt-secret');
        req.user = decoded;
        req.isLoggedIn = true;
        
        // Also set session data if not already set
        if (!req.session.user) {
            req.session.user = decoded;
        }
        
        next();
    } catch (err) {
        res.clearCookie('jwt');
        return res.redirect('/login');
    }
};
