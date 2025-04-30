const mongoose = require('mongoose');

const faqsSchema = new mongoose.Schema({
    Title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    FaqId:{
        type: String,
        required: true
    }
});

const faqs = mongoose.model('faqs', faqsSchema);

module.exports = faqs;