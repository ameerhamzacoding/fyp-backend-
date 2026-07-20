const express = require('express');
const router = express.Router();

const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');

// =======================================================
// POST /api/jobs
// Create job — HR only
// =======================================================
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      skillsRequired,
      expiryDate
    } = req.body;

    const userId =
      req.user?.id ||
      req.user?._id ||
      (typeof req.user === 'string' ? req.user : null);

    if (!userId) {
      return res.status(401).json({
        msg: 'Authentication invalid. User ID could not be resolved.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: 'User not found.'
      });
    }

    if (user.role?.toLowerCase() !== 'hr') {
      return res.status(403).json({
        msg: 'Access denied. Only HR recruiters can post jobs.'
      });
    }

    if (!title || !company || !location || !expiryDate) {
      return res.status(400).json({
        msg: 'Title, company, location, and expiry date are required.'
      });
    }

    let normalizedSkills = [];

    if (Array.isArray(skillsRequired)) {
      normalizedSkills = skillsRequired
        .map((skill) => skill.trim())
        .filter(Boolean);
    } else if (typeof skillsRequired === 'string') {
      normalizedSkills = skillsRequired
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    const job = await Job.create({
      recruiter: userId,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      description: description?.trim() || '',
      skillsRequired: normalizedSkills,
      expiryDate,
      status: 'Active'
    });

    console.log('Created job:', job);

    return res.status(201).json({
      msg: 'Job posting published successfully.',
      job
    });
  } catch (err) {
    console.error('Backend Post Job Error:', err);

    return res.status(500).json({
      msg: 'Server error while creating the job.'
    });
  }
});

// =======================================================
// GET /api/jobs
// HR gets own jobs; other users get all active jobs
// =======================================================
router.get('/', auth, async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      (typeof req.user === 'string' ? req.user : null);

    if (!userId) {
      return res.status(401).json({
        msg: 'Authentication invalid. User ID could not be resolved.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: 'User not found.'
      });
    }

    let query;

    if (user.role?.toLowerCase() === 'hr') {
      query = {
        recruiter: userId
      };
    } else {
      query = {
        status: 'Active',
        expiryDate: {
          $gte: new Date()
        }
      };
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('recruiter', 'name email');

    console.log('Logged-in user ID:', userId);
    console.log('User role:', user.role);
    console.log('Job query:', query);
    console.log('Jobs found:', jobs.length);

    return res.status(200).json({
      count: jobs.length,
      jobs
    });
  } catch (err) {
    console.error('Backend Fetch Jobs Error:', err);

    return res.status(500).json({
      msg: 'Server error while retrieving jobs.'
    });
  }
});

module.exports = router;