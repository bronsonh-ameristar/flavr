const express = require('express');
const MealPlansController = require('../controllers/mealPlansController');
const router = express.Router();

// GET /api/meal-plans - Get meal plans for date range
router.get('/', MealPlansController.getMealPlans);

// POST /api/meal-plans - Add meal to plan
router.post('/', MealPlansController.addMealToPlan);

// DELETE /api/meal-plans/:date/:mealType - Remove meal from plan
router.delete('/:date/:mealType', MealPlansController.removeMealFromPlan);

// GET /api/meal-plans/grocery-list - Generate grocery list
router.get('/grocery-list', MealPlansController.generateGroceryList);

// GET /api/meal-plans/stats - Get meal plan statistics
router.get('/stats', MealPlansController.getMealPlanStats);

module.exports = router;