const express = require('express');
const router = express.Router();
const AssessmentResult = require('../models/Assessment'); 
const auth = require('../middleware/auth');

// ==========================================
// @route   GET api/assessment/my-count
// @desc    Get total assessments taken by current user
// @access  Private
// ==========================================
router.get('/my-count', auth, async (req, res) => {
  try {
    const count = await AssessmentResult.countDocuments({ user: req.user.id });
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// @route   POST api/assessment
// @desc    Save a new assessment result
// @access  Private
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { score, answers } = req.body;

    // Build new assessment document linked directly to logged-in user token
    const newAssessment = new AssessmentResult({
      user: req.user.id, // 🔒 Secured automatically via token payload!
      score: score || 0,
      answers: answers || []
    });

    const savedAssessment = await newAssessment.save();
    res.json({ savedAssessment, msg: 'Assessment submitted and saved successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;