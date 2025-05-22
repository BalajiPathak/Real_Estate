const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const agentAccountSchema = new Schema({
  agentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  Contact_Number: {
    type: String,
    required: true
  },
  AccountNo: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
 
module.exports = mongoose.model('agentAccount', agentAccountSchema);