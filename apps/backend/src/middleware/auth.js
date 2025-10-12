const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Not authenticated' });
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Insufficient permissions' });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (decoded) {
        const user = await User.findById(decoded.userId).select('-passwordHash');
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, authorize, optionalAuth };

