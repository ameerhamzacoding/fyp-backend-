const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Extract the token string from the custom network header
  const token = req.header('x-auth-token');

  // 2. Deny access if no token is passed
  if (!token) {
    return res.status(401).json({ msg: 'No token found, authorization denied' });
  }

  // 3. Verify token validity against your environment secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach decoded payload ({ id, role }) to req object
    next(); // Pass execution flow along to the route controller
  } catch (err) {
    res.status(401).json({ msg: 'Token signature is invalid' });
  }
};