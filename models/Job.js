const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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

  skillsRequired: [
    {
      type: String,
      trim: true
    }
  ],

  description: {
    type: String,
    trim: true
  },

  expiryDate: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['Active', 'Expired', 'Position Filled'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', JobSchema);