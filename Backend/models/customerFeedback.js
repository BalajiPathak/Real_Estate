const mongoose = require('mongoose');

const customerFeedbackSchema = new mongoose.Schema({
    customer_img: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    feedbackText: {
        type: String,
        required: true
    }
}, {
    timestamps: true// we will need when this customer wrote feedback
});

const customerFeedback = mongoose.model('customerFeedback', customerFeedbackSchema);

module.exports = customerFeedback;