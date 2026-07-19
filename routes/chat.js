const express = require('express');
const router = express.Router();
// 🚀 1. Import your Mongoose Profile schema model
const Profile = require('../models/Profile'); 
// If you have an authentication middleware, import it to get the logged-in user's ID
const auth = require('../middleware/auth'); 

// @route   POST api/chat
// @desc    Process chatbot messages dynamically using live database context
// @access  Private (Adding 'auth' middleware ensures we know exactly who is chatting)
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "I didn't catch that. Could you type something?" });
    }

    // 🚀 2. Fetch the logged-in user's live profile from MongoDB dynamically
    const userProfile = await Profile.findOne({ user: req.user.id });

    // Extract real skills array from database, fallback to empty array if none found
    const userSkills = userProfile && userProfile.skills ? userProfile.skills : [];
    
    // Check if user has any data science or web dev keywords to adapt the response dynamically
    const skillsString = userSkills.join(', ').toLowerCase();
    const isDataScientist = skillsString.includes('data') || skillsString.includes('python') || skillsString.includes('machine learning');

    const lowerMessage = message.toLowerCase().trim();
    let aiReply = "";

    // --- INTENT 1: Career Recommendations ---
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("career")) {
      if (userSkills.length === 0) {
        aiReply = "I don't see any skills on your profile yet! Go ahead and add some to your Profile Page, and I will instantly analyze the perfect career track for you.";
      } else if (isDataScientist) {
        aiReply = `Based on your active database profile, I see you are tracking data-driven metrics. With your skills in **${userSkills.join(', ')}**, I highly recommend pursuing a **Data Scientist** track!`;
      } else {
        aiReply = `Looking at the skills currently saved in your database profile (**${userSkills.join(', ')}**), I recommend looking into a **Software Engineer / Web Developer** track!`;
      }
    }
    
    // --- INTENT 2: Live Skills Matrix ---
    else if (lowerMessage.includes("skills") || lowerMessage.includes("identify") || lowerMessage.includes("gap")) {
      if (userSkills.length === 0) {
        aiReply = "Your skills profile is currently empty. Please update your profile page so I can look for gaps.";
      } else {
        aiReply = `Scanning your live profile database... I see you have verified **${userSkills.length} skills**: (${userSkills.join(', ')}). Let's take an assessment quiz next to see what skills you need to add to match top job postings!`;
      }
    }

    // --- INTENT 3: Greetings & Chitchat ---
    else if (/\b(hi|hello|hey)\b/g.test(lowerMessage)) {
      aiReply = "Hello! I am your live AI Career Counselor. Ask me about your skills or career paths anytime!";
    }
    else if (lowerMessage.includes("how are you") || lowerMessage.includes("how r u")) {
      aiReply = "I'm running completely active and connected to your database logs! 🚀 What can we look up together today?";
    }

    // --- INTENT 4: Fallback ---
    else {
      aiReply = "I can read your profile skills live. Try asking me: 'What do you think about my skills?' or 'Which career do you recommend me?'";
    }

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("Dynamic Chatbot Error:", error);
    return res.status(500).json({ reply: "An error occurred while fetching your data metrics." });
  }
});

module.exports = router;