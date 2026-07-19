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
// @desc     Get available job postings (Filtered for HR, Global for Students)
// @access   Private
// =======================================================
router.get('/', auth, async (req, res) => {
  try {
    // 1. Fetch the user profile to identify their dashboard perspective
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile tracking context mismatch.' });
    }

    let query = {};

    // 🚀 FIXED: If the user is HR, filter down so they only retrieve jobs matching their recruiter ID!
    if (user.role === 'hr') {
      query = { recruiter: req.user.id };
    }

    // 2. Fetch based on the dynamically configured query properties
    const jobs = await Job.find(query).sort({ datePosted: -1 });
    res.json(jobs);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;