const mongoose = require('mongoose');

const additionalDetailsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    propertyId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyData',
        required: true
    }
});
module.exports = mongoose.model('AdditionalPropertyDetails', additionalDetailsSchema);