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
    // 1. Safe validation check on request token attachment
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication invalid. No user payload attached.' });
    }

    // Resolve the ID safely whether middleware attaches it as an object or a flat property string
    const userId = req.user.id || (typeof req.user === 'string' ? req.user : req.user._id); 
    
    if (!userId) {
      return res.status(401).json({ msg: 'Authentication invalid. Could not resolve user execution ID.' });
    }

    // 2. Fetch user from DB to verify role dynamically
    const user = await User.findById(userId);
    const userRole = user && user.role ? user.role.toLowerCase() : '';

    if (userRole !== 'hr') {
      return res.status(403).json({ msg: 'Access denied. Only HR recruiters can post jobs.' });
    }

    // 3. Make sure necessary text strings exist
    if (!title || !company || !location) {
      return res.status(400).json({ msg: 'Please fill out title, company, and location parameters.' });
    }

    // 4. Build and link the document model record
    const newJob = new Job({
      recruiter: userId, 
      title,
      company,
      location,
      description,
      expiryDate,
      skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : skillsRequired.split(',').map(s => s.trim())
    });

    const job = await newJob.save();
    return res.status(201).json({ job, msg: 'Job posting published successfully!' });

  } catch (err) {
    console.error("Backend Post Job Error Logged:", err.message);
    return res.status(500).send('Server Error saving job execution map.');
  }
});

// =======================================================
// @route    GET api/jobs
// @desc     Get available job postings (Filtered for HR, Global for Students)
// @access   Private
// =======================================================
router.get('/', auth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication invalid.' });
    }

    const userId = req.user.id || (typeof req.user === 'string' ? req.user : req.user._id);
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User profile tracking context mismatch.' });
    }

    let query = {};

    if (user.role && user.role.toLowerCase() === 'hr') {
      query = { recruiter: userId };
    }

    // Sort safely using both index options so it works on any version configuration setup
    const jobs = await Job.find(query).sort({ createdAt: -1, datePosted: -1 });
    return res.json(jobs);
    
  } catch (err) {
    console.error("Backend Fetch Jobs Error:", err.message);
    return res.status(500).send('Server Error retrieving data.');
  }
});

module.exports = router;