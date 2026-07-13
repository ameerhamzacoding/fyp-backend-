const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  answers: {
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// 🚀 Forcing Mongoose to explicitly target your submission records folder
module.exports = mongoose.model('Assessment', AssessmentSchema, 'assessments');