const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController'); // ADDED LOGIN HERE

// Define the register endpoint
router.post('/register', register);

// Define the login endpoint
router.post('/login', login); // ADDED LOGIN ROUTE HERE

module.exports = router;