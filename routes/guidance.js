const express = require('express');
const router = express.Router();
const axios = require('axios');

const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const Assessment = require('../models/Assessment');

// @route   GET api/guidance/predict-tracks
// @desc    Get AI career recommendations + skill gap
// @access  Private
router.get('/predict-tracks', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(400).json({ msg: 'Please complete your profile first.' });
    }

    const latestAssessment = await Assessment.findOne({ user: req.user.id })
      .sort({ date: -1 });

    if (!latestAssessment) {
      return res.status(400).json({ msg: 'Please complete career assessment first.' });
    }

    const answerTexts = latestAssessment.answers.map(ans => ans.selectedOption);

    const aiPayload = {
      skills: profile.skills || [],
      interests: profile.interests?.[0] || 'Software Development',
      education: profile.education || "Bachelor's Degree",
      experience: 'Beginner',
      work_environment: answerTexts[0] || 'Structured and organized',
      preferred_tech_stack: answerTexts[1] || 'Full-Stack Integration (MERN, Cloud Systems)',
      problem_solving_style: answerTexts[2] || 'Writing clean, modular codebase algorithms',
      career_goal: answerTexts[3] || 'Remote engineering for enterprise teams'
    };

    console.log("========== AI PAYLOAD ==========");
    console.log(JSON.stringify(aiPayload, null, 2));
    console.log("================================");

    const aiResponse = await axios.post(
      `${process.env.AI_SERVICE_URL}/predict-career`,
      aiPayload
    );

    res.json(aiResponse.data);

  } catch (err) {
    console.error('AI guidance error:', err.message);
    res.status(500).json({ msg: 'AI guidance service failed.' });
  }
});

module.exports = router;