const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    City_Name: {
        type: String,
        required: true
    },
    State_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'state',
        required: true
    }
}, {
    timestamps: true
});

const city = mongoose.model('city', citySchema);

module.exports = city;