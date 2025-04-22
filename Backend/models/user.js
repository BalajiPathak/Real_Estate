const mongoose = require('mongoose');

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
        unique: true,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Facebook: {
        type: String
    },
    Twitter: {
        type: String
    },
    Website: {
        type: String
    },
    Public_email: {
        type: String
    },
    Phone: {
        type: String
    },
    FAX: {
        type: String
    },
    user_image: {
        type: String
    },
    user_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userType',
        required: true
    },
    auth_provider: {
        type: String,
        default: 'local'
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    }
});

const user = mongoose.model('user', userSchema);

module.exports = user;