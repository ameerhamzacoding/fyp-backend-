const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =======================================================
// @route   POST api/auth/register
// @desc    Register a new user (Student, Professional, or HR)
// =======================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create a new user instance
    user = new User({ name, email, password, role });

    // 3. Encrypt the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Save the user to MongoDB
    await user.save();

    // 5. Generate a JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // 6. Sign the token and return it to the frontend
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          role: user.role, 
          msg: `Account created successfully! Welcome, ${user.name}!` 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// =======================================================
// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// =======================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare the typed password with the encrypted database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Generate a JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    // 4. Sign the token and return it to the frontend
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '3h' },
      (err, token) => {
        if (err) throw err;
        // 🚀 FIXED: Now passing role back cleanly on login requests too!
        res.json({ 
          token, 
          role: user.role, 
          msg: `Welcome back, ${user.name}!` 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};