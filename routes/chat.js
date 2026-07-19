const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); 
const auth = require('../middleware/auth'); 

// @route   POST api/chat
// @desc    Process chatbot messages dynamically using live DB context and Gemini API via fetch
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

    // 3. Define the direct Google API endpoint url using the active gemini-2.5-pro model
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    // 4. Send the request directly using standard global fetch
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser Query: ${message}` }
            ]
          }
        ]
      })
    });

    // 5. Parse and handle the API response matrix safely
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Direct Gemini API Error Response:", errorText);
      throw new Error(`Google API status error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the text output safely from Google's response object payload
    const aiReply = data.candidates[0].content.parts[0].text;

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("Live Chatbot Error:", error);
    
    // 🚀 Outputting the raw error directly so we can inspect what the endpoint rejects
    return res.json({ 
      reply: `Backend Error: ${error.message}` 
    });
  }
});

module.exports = router;