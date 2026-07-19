const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai'); 
const Profile = require('../models/Profile'); 
const auth = require('../middleware/auth'); 

// Initialize GenAI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST api/chat
// @desc    Process chatbot messages dynamically using live DB context and Gemini LLM
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "I didn't catch that. Could you type something?" });
    }

    // 1. Fetch the user's real skills from your MongoDB database dynamically
    const userProfile = await Profile.findOne({ user: req.user.id });
    const userSkills = userProfile && userProfile.skills ? userProfile.skills : [];
    const skillsListString = userSkills.length > 0 ? userSkills.join(', ') : "No skills added yet";

    // 2. Configure the System Instruction persona constraints
    const systemPrompt = `
You are an advanced, helpful AI Career Counselor integrated into a Final Year Project system.
You have complete access to general knowledge, history, sports, science, and trivia, so feel free to answer any general knowledge queries naturally.

CRITICAL REAL-TIME SYSTEM CONTEXT:
- The logged-in user's actual saved skills in our system database are exactly: [ ${skillsListString} ].
- If the user asks about their skills, missing gaps, profile, or career recommendations, you MUST look at this specific list to give customized advice. 
- Keep your responses professional, concise, encouraging, and tailored to an IT/technical student perspective. Avoid super long blocks of text.
`;

    // 3. Initialize the base model safely
const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // 🚀 Fixed model string
    // 4. Combine system prompt and user query to ensure context is passed directly
    const combinedPrompt = `${systemPrompt}\n\nUser Query: ${message}`;

    // 5. Generate content safely
    const result = await model.generateContent(combinedPrompt);
    const aiReply = result.response.text();

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("Gemini Live Chatbot Error:", error);
    return res.status(500).json({ 
      reply: "My AI cognitive services are temporarily cycling. Let's try that query again in a moment." 
    });
  }
});

module.exports = router;