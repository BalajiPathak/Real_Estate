const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    testimonialText: {
        type: String,
        required: true
    },
    clientImage: {
        type: String,
        required: true,
        default: 'assets/img/client-face1.png'  
    } 
});

module.exports = mongoose.model('Testimonial', testimonialSchema);