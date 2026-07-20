const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // 🚀 IMPORT MONGOOSE FOR DATA CASTING
const Job = require('../models/Job');
const User = require('../models/User'); 
const auth = require('../middleware/auth');

// =======================================================
// @route    POST api/jobs
// =======================================================
router.post('/', auth, async (req, res) => {
  const { title, company, location, description, skillsRequired, expiryDate } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Authentication invalid. No user payload attached.' });
    }

    const userId = req.user.id || (typeof req.user === 'string' ? req.user : req.user._id); 
    
    if (!userId) {
      return res.status(401).json({ msg: 'Authentication invalid. Could not resolve user execution ID.' });
    }

    const user = await User.findById(userId);
    const userRole = user && user.role ? user.role.toLowerCase() : '';

    if (userRole !== 'hr') {
      return res.status(403).json({ msg: 'Access denied. Only HR recruiters can post jobs.' });
    }

    if (!title || !company || !location) {
      return res.status(400).json({ msg: 'Please fill out title, company, and location parameters.' });
    }

    // 🚀 CAST STRING ID TO MONGOOSE OBJECT ID FOR SECURE DATABASE MAPPING
    const recruiterObjectId = new mongoose.Types.ObjectId(userId);

    const newJob = new Job({
      recruiter: recruiterObjectId, 
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
      // 🚀 CAST STRING TO OBJECT ID SO MONGO FIND SEARCHES CLEANLY
      query = { recruiter: new mongoose.Types.ObjectId(userId) };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1, datePosted: -1 });
    return res.json(jobs);
    
  } catch (err) {
    console.error("Backend Fetch Jobs Error:", err.message);
    return res.status(500).send('Server Error retrieving data.');
  }
});

module.exports = router;