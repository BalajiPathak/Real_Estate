const mongoose = require('mongoose');

const submenuTitleSchema = new mongoose.Schema({
    title_name: {
        type: String,
        required: true
    },
    navbar_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'navbar',
        required: true
    }
});

const submenuTitle = mongoose.model('submenuTitle', submenuTitleSchema);

module.exports = submenuTitle;