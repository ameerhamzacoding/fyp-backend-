const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // 🚀 THE CRITICAL LINK: This must be explicitly defined here!
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Filled'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', JobSchema);