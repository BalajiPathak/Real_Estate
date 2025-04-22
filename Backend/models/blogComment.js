const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    Comment: {
        type: String,
        required: true
    },
    Blog_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, {
    timestamps: true
});

const blogComment = mongoose.model('blogComment', blogCommentSchema);

module.exports = blogComment;