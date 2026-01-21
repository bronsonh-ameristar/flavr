const express = require('express');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', AuthController.register);

// POST /api/auth/login - Login user
router.post('/login', AuthController.login);

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', authenticate, AuthController.me);

module.exports = router;
