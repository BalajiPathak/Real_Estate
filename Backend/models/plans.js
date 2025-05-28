const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['Free', 'Silver', 'Gold']
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number, 
        required: true
    },
    propertySubmissionLimit: {
        type: Number,
        required: true
    },
    features: {
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
   
}, {
    timestamps: true
});

// Create index for plan name if it doesn't exist
if (!planSchema.indexes().find(index => index[0].name === 1)) {
    planSchema.index({ name: 1 }, { unique: true });
}

const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema);

module.exports = Plan;