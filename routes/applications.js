const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Note: You can create a full Mongoose model for this later, 
// but this allows you to cleanly handle requests right now.

// @route    POST api/applications/:jobId
// @desc     Apply for a job posting
// @access   Private
router.post('/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job post not found.' });
    }
    res.json({ msg: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;