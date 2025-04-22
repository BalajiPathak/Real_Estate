const mongoose = require('mongoose');

const propertyFeatureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

const propertyDataFeatureSchema = new mongoose.Schema({
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyData',
        required: true
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyFeature',
        required: true
    }
}, {
    timestamps: true
});

const PropertyFeature = mongoose.model('PropertyFeature', propertyFeatureSchema);
const PropertyDataFeature = mongoose.model('PropertyDataFeature', propertyDataFeatureSchema);

module.exports = {
    PropertyFeature,
    PropertyDataFeature
};