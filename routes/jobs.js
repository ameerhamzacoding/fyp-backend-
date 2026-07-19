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
    // 1. Fetch user from DB to verify role dynamically
    const user = await User.findById(req.user.id);
    
    // 🚀 FIXED: Added fallback and case-insensitivity check (.toLowerCase()) so 'HR' or 'hr' both pass safely
    if (!user || !user.role || user.role.toLowerCase() !== 'hr') {
      console.log(`[POST REJECTED] User ${req.user.id} has role '${user?.role}' instead of 'hr'`);
      return res.status(403).json({ msg: 'Access denied. Only HR recruiters can post jobs.' });
    }

    // 2. Validate essential fields aren't blank
    if (!title || !company || !location) {
      return res.status(400).json({ msg: 'Please provide title, company, and location.' });
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
    console.log(`[SUCCESS] New Job Document Saved: "${job.title}" by Recruiter ID: ${req.user.id}`);
    
    return res.status(201).json({ job, msg: 'Job posting published successfully!' });

  } catch (err) {
    console.error("Backend Post Job Error:", err.message);
    res.status(500).send('Server Error saving job.');
  }
});

// =======================================================
// @route    GET api/jobs
// @desc     Get available job postings (Filtered for HR, Global for Students)
// @access   Private
// =======================================================
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User profile tracking context mismatch.' });
    }

    let query = {};

    if (user.role && user.role.toLowerCase() === 'hr') {
      query = { recruiter: req.user.id };
    }

    // 🚀 FIXED: Added a safe fallback sort parameter. If your model uses 'createdAt' instead of 'datePosted', 
    // it will sort cleanly without returning an empty state list!
    const jobs = await Job.find(query).sort({ createdAt: -1, datePosted: -1 });
    
    console.log(`[GET JOBS] Recruiter "${req.user.id}" fetched ${jobs.length} total active job entries.`);
    return res.json(jobs);
    
  } catch (err) {
    console.error("Backend Fetch Jobs Error:", err.message);
    res.status(500).send('Server Error retrieving data.');
  }
});

module.exports = router;