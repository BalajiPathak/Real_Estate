const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
    Logo: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Phone_No: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    facebook: {
        type: String
    },
    Instagram: {
        type: String
    },
    twitter: {
        type: String
    },
    linkedIn: {
        type: String
    },
    HAPPY_CUSTOMER: {
        type: Number,
        default: 0
    },
    Properties_in_stock: {
        type: Number,
        default: 0
    },
    City_registered: {
        type: Number,
        default: 0
    },
    DEALER_BRANCHES: {
        type: Number,
        default: 0
    },
    geo_longitude: {
        type: Number,
        required: true
    },
    geo_latituse: {
        type: Number,
        required: true
    }
}, {
    collection: 'company_info'
});

const Company_Info = mongoose.model('Company_Info', companyInfoSchema);

module.exports = Company_Info;