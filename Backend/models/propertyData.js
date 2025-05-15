const mongoose = require('mongoose');

const propertyDataSchema = new mongoose.Schema({
    image: {
        type:String,
        required: true
    },
    name: {
        type:String,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    saleStatus: {
        type: String,
        enum: ['available', 'sold'],
        default: 'available',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PropertyCategory',
        required: true
    },
    phone: {
        type:Number,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: true
    },
    cityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },
    statusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StatusCategory',
        required: true
    },
    beds: {
        type:Number,
        required: true
    },
    baths: {
        type:Number,
        required: true
    },
    area: {
        type:Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    termsAndConditions: {
        type:Boolean,
        required: true
    }
});

module.exports = mongoose.model('PropertyData', propertyDataSchema);