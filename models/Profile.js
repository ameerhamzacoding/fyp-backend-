const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  education: {
    type: String,
    default: ''
  },
  skills: {
    type: [String], // Ensures array storage structure
    default: []
  },
  interests: {
    type: [String], // Ensures array storage structure
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('profile', ProfileSchema);