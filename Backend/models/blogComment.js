const mongoose = require('mongoose');

const blogCommentSchema = new mongoose.Schema({
    Comment: {
        type: String,
        required: true
    },
    BlogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: true
    },
    name:{
        type:String,
        required:true
    },
    Img:{
        type:String,
        requires:true
    },
    Date: {
        type: Date,
        default: Date.now,
        required: true
    },
}, {
    timestamps: true
});

const blogComment = mongoose.model('blogComment', blogCommentSchema);

module.exports = blogComment;