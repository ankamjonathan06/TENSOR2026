const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_2024');

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'The user belonging to this token no longer exists' });
    }

    // Grant access
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token or session expired' });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
};
