const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/generative-ai'); // Import Gemini SDK
const Profile = require('../models/Profile'); 
const auth = require('../middleware/auth'); 

// Initialize the Google Gen AI instance with your .env key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    // 2. Configure a strict System Instruction for the LLM
    const systemInstruction = `
      You are an advanced, helpful AI Career Counselor integrated into a Final Year Project system.
      You have complete access to general knowledge, history, sports, science, and trivia, so feel free to answer any general knowledge queries naturally.
      
      CRITICAL REAL-TIME SYSTEM CONTEXT:
      - The logged-in user's actual saved skills in our system database are exactly: [ ${skillsListString} ].
      - If the user asks about their skills, missing gaps, profile, or career recommendations, you MUST look at this specific list to give customized advice. 
      - Keep your responses professional, concise, encouraging, and tailored to an IT/technical student perspective. Avoid super long blocks of text.
    `;

    // 3. Initialize the model with the persona instructions
    const model = ai.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Fast, responsive conversational model
      systemInstruction: systemInstruction 
    });

    // 4. Generate content by passing the user's input message straight to the LLM
    const result = await model.generateContent(message);
    const aiReply = result.response.text();

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("Gemini Live Chatbot Error:", error);
    // 🚀 Fallback mechanism: If the API key fails or internet drops, the app won't break!
    return res.status(500).json({ 
      reply: "My AI cognitive services are temporarily cycling. Let's try that query again in a moment." 
    });
  }
});

module.exports = router;