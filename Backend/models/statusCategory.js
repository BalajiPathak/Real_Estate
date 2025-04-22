const mongoose= require('mongoose');

const statusCategorySchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    }
  });


module.exports = mongoose.model('StatusCategory', statusCategorySchema);