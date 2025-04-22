const mongoose = require('mongoose');

const userTypeSchema = new mongoose.Schema({
    user_type_name: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const userType = mongoose.model('userType', userTypeSchema);

module.exports = userType;