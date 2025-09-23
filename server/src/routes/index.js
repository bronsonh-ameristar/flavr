const express = require('express');
const mealsRoutes = require('./meals');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ message: 'Meal Tracker API is running!', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/meals', mealsRoutes);

module.exports = router;