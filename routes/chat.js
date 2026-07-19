const express = require('express');
const router = express.Router();

// Mock profile payload matching your FYP system specifications
const mockUserProfile = {
  role: "Student",
  activeSkillsCount: 6,
  matchScore: "88%",
  targetRole: "Cloud Infrastructure Architect"
};

// @route   POST api/chat
// @desc    Process chatbot message arrays and return context replies
// @access  Public (or Private depending on your auth middleware setup)
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "I didn't catch that. Could you type something?" });
    }

    const lowerMessage = message.toLowerCase().trim();
    let aiReply = "";

    // 1. Chitchat Handler Intent
    if (lowerMessage.includes("how are you") || lowerMessage.includes("how r u")) {
      aiReply = "I'm functioning perfectly and ready to help! 🚀 As your AI Career Counselor, I'm fully loaded with your profile metrics. What are we working on today?";
    } 
    else if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      aiReply = "Hello! I am your personalized AI Career Counselor. How can I guide your professional journey today?";
    }
    // 2. Career Recommendation Intent 
    else if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("what should i do")) {
      aiReply = `Based on your active **${mockUserProfile.role}** profile, I see you have ${mockUserProfile.activeSkillsCount} identified core skills. Given your evaluation matrices, I highly recommend looking into a **${mockUserProfile.targetRole}** track—your current profile has a **${mockUserProfile.matchScore} match score**.`;
    }
    // 3. Fallback
    else {
      aiReply = "I can provide career track recommendations or identify your missing skill gaps. Try asking me: 'What would you recommend me?'";
    }

    return res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return res.status(500).json({ reply: "An error occurred within the chatbot system core." });
  }
});

module.exports = router;
