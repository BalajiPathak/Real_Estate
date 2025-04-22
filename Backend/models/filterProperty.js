const mongoose =require('mongoose');

const filterPropertySchema = new mongoose.Schema({
    filterCriteria: {
        type:String,
        required:true
    },
    minRange:{
        type:Number,
        required:true
    },
    maxRange: {
        type:Number,
        required:true
    }
  });
  const FilterProperty = mongoose.model('FilterProperty', filterPropertySchema);

module.exports= FilterProperty;