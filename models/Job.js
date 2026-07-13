const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  skillsRequired: [{ type: String }],
  description: { type: String },
  // 🌟 NEW FIELD: Capture when the job card naturally goes offline
  expiryDate: { type: Date, required: true }, 
  // 🌟 ENHANCED FIELD: Support dynamic lifecycle status states
  status: { 
    type: String, 
    enum: ['Active', 'Expired', 'Position Filled'], 
    default: 'Active' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);