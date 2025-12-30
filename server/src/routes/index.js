// server/routes/index.js
const express = require('express');
const mealsRoutes = require('./meals');
const mealPlansRoutes = require('./mealPlans');
const authRoutes = require('./auth');
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ message: 'Meal Tracker API is running!', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/meals', mealsRoutes);
router.use('/meal-plans', mealPlansRoutes);

module.exports = router;
