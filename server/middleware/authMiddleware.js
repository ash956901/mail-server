const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Received token:', token ? 'exists' : 'missing'); // Debug log

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Debug log

    const user = await User.findById(decoded.userId).select('-password');
    console.log('Found user:', user ? 'exists' : 'not found'); // Debug log

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      error: error.message,
      stack: error.stack
    });
    res.status(401).json({ message: 'Token is not valid', details: error.message });
  }
};

module.exports = authMiddleware;