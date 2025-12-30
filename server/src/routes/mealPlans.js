const express = require('express');
const MealPlansController = require('../controllers/mealPlansController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All meal plan routes require authentication

// Specific routes MUST come before parameterized routes
// GET /api/meal-plans/grocery-list - Generate grocery list
router.get('/grocery-list', authenticate, MealPlansController.generateGroceryList);

// GET /api/meal-plans/stats - Get meal plan statistics
router.get('/stats', authenticate, MealPlansController.getMealPlanStats);

// GET /api/meal-plans - Get meal plans for date range
router.get('/', authenticate, MealPlansController.getMealPlans);

// POST /api/meal-plans - Add meal to plan
router.post('/', authenticate, MealPlansController.addMealToPlan);

// DELETE /api/meal-plans/:date/:mealType - Remove meal from plan
router.delete('/:date/:mealType', authenticate, MealPlansController.removeMealFromPlan);

module.exports = router;
