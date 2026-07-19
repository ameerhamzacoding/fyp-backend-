const express = require('express');
const router = express.Router();

// Real profile payload matching your FYP system specifications
const mockUserProfile = {
  role: "Student",
  activeSkillsCount: 6,
  matchScore: "88%",
  targetRole: "Cloud Infrastructure Architect"
};

// @route   POST api/chat
// @desc    Process chatbot message arrays and return context replies
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "I didn't catch that. Could you type something?" });
    }

    const lowerMessage = message.toLowerCase().trim();
    let aiReply = "";

    // 🚀 FIX: Move core career features to the TOP so they take priority over greetings
    // --- INTENT 1: Career Recommendations ---
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("career")) {
      aiReply = `Based on your active **${mockUserProfile.role}** profile, I see you have ${mockUserProfile.activeSkillsCount} identified core skills. Given your evaluation matrices, I highly recommend looking into a **${mockUserProfile.targetRole}** track—your current profile has a **${mockUserProfile.matchScore} match score**.`;
    }
    
    // --- INTENT 2: Skills & Gaps Tracking ---
    else if (lowerMessage.includes("skills") || lowerMessage.includes("identify") || lowerMessage.includes("gap")) {
      aiReply = `Looking at your profile logs, you have solid foundations in web development stacks, but there is a clear **Skill Gap** in cloud architecture deployment frameworks. I recommend taking the next automated verification quiz to bridge this gap!`;
    }

    // --- INTENT 3: Profile Specifics ("What do you know about me") ---
    else if (lowerMessage.includes("know about me") || lowerMessage.includes("my profile")) {
      aiReply = `I know that you are currently registered as an Information Technology **${mockUserProfile.role}**. Your backend metrics indicate a strong focus toward web services and CRM tools!`;
    }

    // --- INTENT 4: Tightened Greetings (Using regex whole-word boundaries \b to avoid matching inside "which" or "think") ---
    else if (/\b(hi|hello|hey)\b/g.test(lowerMessage)) {
      aiReply = "Hello! I am your personalized AI Career Counselor. How can I guide your professional journey today?";
    }
    
    else if (lowerMessage.includes("how are you") || lowerMessage.includes("how r u")) {
      aiReply = "I'm functioning perfectly and ready to help! 🚀 As your AI Career Counselor, I'm fully loaded with your profile metrics. What are we working on today?";
    }

    // --- INTENT 5: Fallback ---
    else {
      aiReply = "I can provide personalized career track recommendations, evaluate your profile metrics, or pinpoint missing skill gaps. Try asking me: 'Which career do you recommend me?' or 'What do you think about my skills?'";
    }

    return res.json({ reply: aiReply });
  } catch (error) {
    console.error("Chatbot Error:", error);
    return res.status(500).json({ reply: "An error occurred within the chatbot system core." });
  }
});

module.exports = router;