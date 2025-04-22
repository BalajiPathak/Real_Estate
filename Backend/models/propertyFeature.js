const mongoose = require('mongoose');

const propertyFeatureSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    }
});

const propertyDataFeatureSchema = new mongoose.Schema({
    propertyId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyData',
        required: true
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyFeature',
        required: true
    }
});


module.exports = mongoose.model('PropertyFeature', propertyFeatureSchema);
module.exports = mongoose.model('PropertyDataFeature', propertyDataFeatureSchema);