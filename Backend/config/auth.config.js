module.exports = {
    jwt: {
        secret: 'your-jwt-secret-key',
        expiresIn: '24h'
    },
    google: {
        clientID: '827877143320-bn74110jsiig5eqijcrhgj80ls9ug3ve.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'http://localhost:3006/auth/google/callback'
    },
    facebook: {
        clientID: '1432253888148158',
        clientSecret: 'c8c99cc08f2a5a8d8c4e1263132e71f2',
        callbackURL: 'http://localhost:3006/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name']
    }
};