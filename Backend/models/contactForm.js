const mongoose = require('mongoose');

const contactFormSchema = new mongoose.Schema({
    First_Name: {
        type: String,
        required: true
    },
    Last_Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Message: {
        type: String,
        required: true
    },
    Subject: {
        type: String,
        required: true
    }
});

const contactForm = mongoose.model('contactForm', contactFormSchema);

module.exports = contactForm;