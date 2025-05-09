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
        clientID: '1824635041714881',
        clientSecret: '8291d711986c026a2686fcab5b5e223a',
        callbackURL: `${callbackbaseURL}/auth/facebook/callback`,
        profileFields: ['id', 'emails', 'name', 'displayName'],
        scope: ['email', 'public_profile'], 
        termsURL: `${callbackbaseURL}/terms-of-service`,
        privacyURL: `${callbackbaseURL}/privacy-policy`
    }
};