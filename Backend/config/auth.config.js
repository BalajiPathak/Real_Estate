const callbackbaseURL = process.env.BASE_URL || 'http://localhost:3006'; 
module.exports = {
    jwt: {
        secret: 'your-jwt-secret-key',
        expiresIn: '24h'
    },
    google: {
        clientID: '827877143320-bn74110jsiig5eqijcrhgj80ls9ug3ve.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: `${callbackbaseURL}/auth/google/callback`
    },
    facebook: {
        clientID: '1432253888148158',
        clientSecret: 'c8c99cc08f2a5a8d8c4e1263132e71f2',
        callbackURL: `${callbackbaseURL}/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'displayName'],
        scope: ['email', 'public_profile'], // Add this line to request permissions
        termsURL: 'https://real-estate-4-cetp.onrender.com/terms-of-service',
        privacyURL: 'https://real-estate-4-cetp.onrender.com/privacy-policy'
    }
};