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
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AgentMessage', agentMessageSchema);