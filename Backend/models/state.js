const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    State_Name: {
        type: String,
        required: true,
        unique: true
    }
});

const state = mongoose.model('state', stateSchema);

module.exports = state;