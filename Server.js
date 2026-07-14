const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); 

// Define Routes
app.use('/api/auth', require('./routes/auth_temp')); 
app.use('/api/profile', require('./routes/profile'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/guidance', require('./routes/guidance'));
// 🚀 ADD THIS LINE TO LINK YOUR ASSESSMENT ENTRIES:
app.use('/api/assessment', require('./routes/assessment'));
app.use('/api/match', require('./routes/match'));

// Simple Test Route
app.get('/', (req, res) => {
  res.send('FYP Backend API is running...');
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;