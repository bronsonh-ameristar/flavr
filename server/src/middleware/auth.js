const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not defined in environment variables');
}

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided',
        success: false
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user from database to ensure they still exist
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: 'User not found',
          success: false
        });
      }

      // Attach user to request
      req.user = user;
      req.userId = user.id;

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired',
          message: 'Your session has expired. Please log in again.',
          success: false
        });
      }

      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is malformed or invalid',
          success: false
        });
      }

      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
      success: false
    });
  }
};

/**
 * Optional authentication middleware - attaches user if token present, but doesn't require it
 * Useful for routes that work for both authenticated and anonymous users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      req.user = user;
      req.userId = user ? user.id : null;
    } catch (jwtError) {
      // Token invalid or expired, continue without user
      req.user = null;
      req.userId = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    req.userId = null;
    next();
  }
};

/**
 * Generate JWT token for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken
};
