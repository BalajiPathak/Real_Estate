const mongoose = require('mongoose');

const agentMessageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    agentName: {
        type: String,
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Removed required: true since it's optional for agent messages
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AgentMessage', agentMessageSchema);