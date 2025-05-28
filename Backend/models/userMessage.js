const mongoose = require('mongoose');

const userMessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyData',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isAgentReply: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('UserMessage', userMessageSchema);