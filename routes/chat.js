const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); 
const User = require('../models/User'); 
const auth = require('../middleware/auth'); 

// @route   POST api/chat
// @desc    Process chatbot messages dynamically based on user role (Student vs Professional vs HR)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ reply: "I didn't catch that. Could you type something?" });
    }

    // 1. Fetch the user from the database to check their role dynamically
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User context not found.' });
    }

    // Fetch profile context if the user is a tech candidate (Student or Professional)
    let skillsListString = "No skills added yet";
    if (user.role !== 'hr') {
      const userProfile = await Profile.findOne({ user: req.user.id });
      if (userProfile && userProfile.skills && userProfile.skills.length > 0) {
        skillsListString = userProfile.skills.join(', ');
      }
    }

    let systemPrompt = "";

    // 2. Distribute the specific prompt constraint matrix based on user role
    if (user.role === 'hr') {
      // 🏢 HR Recruiter Persona
      systemPrompt = `
You are an advanced, efficient AI Recruitment Assistant integrated into an HR and Career Counseling portal.
You have complete access to general knowledge, business trends, history, science, and trivia, so feel free to answer any general questions naturally.

CRITICAL REAL-TIME HR CONTEXT:
- The user talking to you is an HR recruiter/hiring manager.
- Your goal is to help them optimize their recruitment workflows. 
- You can help them write job descriptions, generate interview questions, structure technical assessment parameters, and advise on candidate shortlisting strategies.
- Keep your responses concise, corporate, sharp, and highly professional. Avoid long walls of text.
`;
    } else if (user.role === 'professional') {
      // 💼 Experienced Professional Persona
      systemPrompt = `
You are an advanced AI Career Strategy Advisor tailored specifically for Experienced Industry Professionals.
You have complete access to general knowledge, advanced technical architecture concepts, global corporate structures, and trivia, so feel free to answer any query naturally.

CRITICAL REAL-TIME PROFESSIONAL CONTEXT:
- The logged-in user is an industry professional looking to scale up their career, switch domains, or target leadership roles.
- Their actual saved skills in our database are exactly: [ ${skillsListString} ].
- Focus your advice on advanced certifications (e.g., Salesforce Administration, AWS Architecture), mid-to-senior level career transitions, management pathways, and addressing skill gaps for senior technical roles.
- Speak to them as an expert, peer-level strategic advisor. Keep answers sharp, high-impact, and professional.
`;
    } else {
      // 🎓 Undergraduate Student Persona
      systemPrompt = `
You are an advanced, helpful AI Career Counselor integrated into a Final Year Project system.
You have complete access to general knowledge, history, sports, science, and trivia, so feel free to answer any general knowledge queries naturally.

CRITICAL REAL-TIME STUDENT CONTEXT:
- The logged-in user is an undergraduate student looking for internships, entry-level jobs, and baseline technical foundations.
- Their actual saved skills in our system database are exactly: [ ${skillsListString} ].
- If the user asks about their skills, missing gaps, profile, or career recommendations, you MUST look at this specific list to give customized advice. 
- Keep your responses professional, concise, encouraging, and tailored to an IT/technical student perspective.
`;
    }

    // 3. Define the direct Google API endpoint url using the active gemini-3.5-flash model
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Direct Gemini API Error Response:", errorText);
      throw new Error(`Google API status error: ${response.status}`);
    }

    const data = await response.json();
    const aiReply = data.candidates[0].content.parts[0].text;

    return res.json({ reply: aiReply });

  } catch (error) {
    console.error("Live Chatbot Error:", error);
    return res.json({ 
      reply: "I'm processing a high volume of requests right now. Let's try that query again in a quick second!" 
    });
  }
});

module.exports = router;