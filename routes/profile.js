const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// @route    GET api/profile/me
// @desc     Get current user's profile configuration
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.json(null); 
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile parameters
// @access   Private
router.post('/', auth, async (req, res) => {
  const { education, skills, interests } = req.body;

  // Build a clean tracking object field collection mapping
  const profileFields = {};
  profileFields.user = req.user.id;
  profileFields.education = education || '';
  
  // Directly bind arrays passed from checkbox states cleanly
  profileFields.skills = Array.isArray(skills) ? skills : [];
  profileFields.interests = Array.isArray(interests) ? interests : [];

  try {
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true }
    );
    res.json({ profile, msg: 'Profile data synchronized securely!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;