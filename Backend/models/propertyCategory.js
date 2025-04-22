const mongoose = require('mongoose');

const propertyCategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    } 
});

module.exports = mongoose.model('PropertyCategory', propertyCategorySchema);