const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route    POST api/chatbot
// @desc     Interactive career counseling guidance chatbot
// @access   Private
router.post('/', auth, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ msg: 'Please enter a message.' });
  }

  try {
    const userMessage = message.toLowerCase().trim();
    let botResponse = "";

    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      botResponse = "Hello! I am your LIVEX UMT AI Career Assistant. How can I help map your skills to global opportunities today?";
    } else if (userMessage.includes('skill') || userMessage.includes('learn')) {
      botResponse = "To maximize your job matching probabilities, I highly recommend filling out your Technical Skills checkboxes and completing the platform's Career Assessment.";
    } else if (userMessage.includes('germany') || userMessage.includes('uae') || userMessage.includes('abroad')) {
      botResponse = "Our tracking metrics show high market demands in Germany and the UAE for Full-Stack Developers and Data Scientists. Ensure your profile targets these regions.";
    } else if (userMessage.includes('resume') || userMessage.includes('cv')) {
      botResponse = "Make sure your profile skills exactly mirror the text keywords listed on your resume so our AI Matching engine ranks you higher for recruiters.";
    } else {
      botResponse = "That's an interesting career path choice! I recommend matching your core technical skills against our active job postings board to see targeted matching analytics.";
    }

    res.json({ response: botResponse });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Chatbot service error.');
  }
});

module.exports = router;