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

// POST /api/meal-plans/copy-week - Copy a week of meal plans to another week
router.post('/copy-week', authenticate, MealPlansController.copyWeek);

// POST /api/meal-plans/save-as-template - Save a week as a template
router.post('/save-as-template', authenticate, MealPlansController.saveAsTemplate);

// POST /api/meal-plans/prep-plan - Generate a consolidated prep plan
router.post('/prep-plan', authenticate, MealPlansController.generatePrepPlan);

// GET /api/meal-plans - Get meal plans for date range
router.get('/', authenticate, MealPlansController.getMealPlans);

// POST /api/meal-plans - Add meal to plan
router.post('/', authenticate, MealPlansController.addMealToPlan);

// DELETE /api/meal-plans/:date/:mealType - Remove meal from plan
router.delete('/:date/:mealType', authenticate, MealPlansController.removeMealFromPlan);

module.exports = router;
