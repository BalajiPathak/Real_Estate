const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    Banner_Img: {
        type: String,
        required: true
    },
    Navbar_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'navbar',  
        required: true
    },
    banner_detail_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'banner_details',  // Updated to match the model name
        required: true
    }
});

const banner = mongoose.model('banner', bannerSchema);

module.exports = banner;