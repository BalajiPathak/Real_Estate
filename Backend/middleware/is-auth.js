const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'your-jwt-secret');
        req.user = decoded;
        req.isLoggedIn = true;
        next();
    } catch (err) {
        res.clearCookie('jwt');
        return res.redirect('/login');
    }
};
