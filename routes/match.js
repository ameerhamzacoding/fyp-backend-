const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// @route    GET api/match
// @desc     Calculate job matches based on user skill overlaps
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile || !profile.skills || profile.skills.length === 0) {
      return res.json([]);
    }

    const userSkills = profile.skills.map(s => s.toLowerCase().trim());

    const jobs = await Job.find({ status: 'Active' });

    const matchedJobs = jobs.map(job => {
      if (!job.skillsRequired || job.skillsRequired.length === 0) {
        return { ...job._doc, matchPercentage: 0, matchedSkills: [] };
      }

      const jobSkills = job.skillsRequired.map(s => s.toLowerCase().trim());
      const overlappingSkills = jobSkills.filter(skill => userSkills.includes(skill));

      const matchPercentage = Math.round(
        (overlappingSkills.length / jobSkills.length) * 100
      );

      return {
        ...job._doc,
        matchPercentage,
        matchedSkills: overlappingSkills
      };
    });

    // Show only meaningful matches
    const sortedMatches = matchedJobs
      .filter(job => job.matchPercentage >= 40)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json(sortedMatches);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;