const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

// Add a global meal to personal list
router.post('/global/:searchMealId/add', mealController.addGlobalMealToPersonal);

// Check if user has a meal
router.get('/global/:searchMealId/check', mealController.checkMealInPersonalList);

// Get user's meals
router.get('/my-meals', mealController.getUserMeals);

module.exports = router;