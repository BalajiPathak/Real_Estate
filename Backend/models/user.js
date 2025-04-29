const mongoose = require('mongoose');

// Drop existing indexes when connecting
mongoose.connection.once('open', async () => {
    try {
        // Drop all indexes
        await mongoose.connection.db.collection('users').dropIndexes();
    } catch (err) {
        console.log('No indexes to drop');
    }
});

const userSchema = new mongoose.Schema({
    First_Name: {
        type: String,
        required: true
    },
    Last_Name: {
        type: String,
        required: true
    },
    Password: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Facebook: {
        type: String,
        default: null
    },
    Twitter: {
        type: String,
        default: null
    },
    Website: {
        type: String,
        default: null
    },
    Public_email: {
        type: String,
        default: null
    },
    Phone: {
        type: String,
        default: null
    },
    FAX: {
        type: String,
        default: null
    },
    user_image: {
        type: String,
        default: null
    },
    user_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userType',
        required: false,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    auth_provider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    resetToken: String,
    resetTokenExpiration: Date
}, {
    timestamps: true
});

// Create only the necessary indexes
userSchema.index({ Email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
