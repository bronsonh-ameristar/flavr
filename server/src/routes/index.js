// server/routes/index.js
const express = require('express');
const mealsRoutes = require('./meals');
const mealPlansRoutes = require('./mealPlans');
const searchRoutes = require('./search')
const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ message: 'Meal Tracker API is running!', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/meals', mealsRoutes);
router.use('/meal-plans', mealPlansRoutes);
router.use('/search-meals', searchRoutes);

module.exports = router;