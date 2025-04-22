const mongoose = require('mongoose');

const submenusSchema = new mongoose.Schema({
    submenu_name: {
        type: String,
        required: true
    },
    submenu_title_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'submenuTitle',
        required: true
    },
    is_Quick_link: {
        type: Boolean,
        default: false
    }
});

const submenus = mongoose.model('submenus', submenusSchema);

module.exports = submenus;