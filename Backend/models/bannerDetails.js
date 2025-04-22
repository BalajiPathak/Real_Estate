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

const Banner_Details = mongoose.model('Banner_Details', bannerDetailsSchema);

module.exports = Banner_Details;