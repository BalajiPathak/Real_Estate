const mongoose = require('mongoose');
const Faqs = require('../models/faqs');

 
exports.getAllFaqs = async (req, res) => {
  const faqs = await Faqs.find();
  console.log(faqs);
  res.render('faqs/faqs', { pageTitle: 'Real Estate', faqs });
};
 
