const { User } = require('../../models');
const { generateToken } = require('../middleware/auth');

class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Username, email, and password are required',
          success: false
        });
      }

      // Validate username format (3-50 chars, alphanumeric + underscore)
      if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Username must be 3-50 characters and contain only letters, numbers, and underscores',
          success: false
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Please provide a valid email address',
          success: false
        });
      }

      // Validate password length (min 8 chars)
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Password must be at least 8 characters long',
          success: false
        });
      }

      // Check if username already exists
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(409).json({
          error: 'Registration failed',
          message: 'Username already exists',
          success: false
        });
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({
          error: 'Registration failed',
          message: 'Email already registered',
          success: false
        });
      }

      // Create user (password will be hashed by model hook)
      const user = await User.create({
        username,
        email,
        passwordHash: password
      });

      // Generate JWT token
      const token = generateToken(user);

      res.status(201).json({
        message: 'Registration successful',
        data: {
          user: user.toJSON(),
          token
        },
        success: true
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
          success: false
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Registration failed',
          message: 'Username or email already exists',
          success: false
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        message: 'An error occurred during registration',
        success: false
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user with email/username and password
   */
  static async login(req, res) {
    try {
      const { email, username, password } = req.body;

      // Validate required fields
      if ((!email && !username) || !password) {
        return res.status(400).json({
          error: 'Validation failed',
          message: 'Email or username and password are required',
          success: false
        });
      }

      // Find user by email or username
      const whereClause = email ? { email } : { username };
      const user = await User.findOne({ where: whereClause });

      if (!user) {
        return res.status(401).json({
          error: 'Login failed',
          message: 'Invalid credentials',
          success: false
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Login failed',
          message: 'Invalid credentials',
          success: false
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token
        },
        success: true
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'An error occurred during login',
        success: false
      });
    }
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user profile
   */
  static async me(req, res) {
    try {
      // req.user is attached by authenticate middleware
      res.json({
        data: {
          user: req.user.toJSON()
        },
        success: true
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: 'An error occurred while fetching profile',
        success: false
      });
    }
  }
}

module.exports = AuthController;
