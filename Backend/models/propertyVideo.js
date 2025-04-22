const mongoose = require('mongoose');

const propertyVideosSchema = new mongoose.Schema({
    video:  {
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
module.exports = mongoose.model('PropertyVideo', propertyVideosSchema);