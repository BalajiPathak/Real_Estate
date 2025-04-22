const mongoose = require('mongoose');

const propertyImagesSchema = new mongoose.Schema({
    image:  {
        type:String,
        required: false
    },
    propertyId:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyData',
        required: true
    }
});

module.exports = mongoose.model('PropertyImages', propertyImagesSchema);