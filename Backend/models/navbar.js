const mongoose = require('mongoose');

const navbarSchema = new mongoose.Schema({
    Navbar_Name: {
        type: String,
        required: true
    }
});

const Navbar = mongoose.model('Navbar', navbarSchema);

module.exports = Navbar;