const mongoose = require('mongoose');

const bannerDetailsSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Tag_line: {
        type: String,
        required: true
    }
});

const BannerDetails = mongoose.model('banner_details', bannerDetailsSchema);

module.exports = BannerDetails;