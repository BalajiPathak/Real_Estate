const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    Auther: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now,
        required: true
    },
    Img: {
        type: String,
        required: true
    },
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const blog = mongoose.model('blog', blogSchema);

module.exports = blog;