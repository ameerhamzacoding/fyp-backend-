const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const User = require('../models/User'); 
const auth = require('../middleware/auth');

// =======================================================
// @route    POST api/jobs
// @desc     Create a new job posting (HR Only)
// @access   Private
// =======================================================
router.post('/', auth, async (req, res) => {
  // 🚀 FIXED: Added expiryDate to the destructured body fields
  const { title, company, location, description, skillsRequired, expiryDate } = req.body;

  try {
    // Fetch user from DB to verify role dynamically
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'hr') {
      return res.status(401).json({ msg: 'Access denied. Only HR recruiters can post jobs.' });
    }

    const newJob = new Job({
      recruiter: req.user.id,
      title,
      company,
      location,
      description,
      // 🚀 FIXED: Explicitly added expiryDate here so Mongoose receives it!
      expiryDate,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map(s => s.trim())
    });

    const job = await newJob.save();
    res.json({ job, msg: 'Job posting published successfully!' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// =======================================================
// @route    GET api/jobs
// @desc     Get all available job postings for matching dashboards
// @access   Private (Students & Professionals can browse)
// =======================================================
router.get('/', auth, async (req, res) => {
  try {
    // Fetch jobs and sort by newest first
    const jobs = await Job.find().sort({ datePosted: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;