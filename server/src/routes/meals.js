const express = require('express');
const MealsController = require('../controllers/mealsController');
const router = express.Router();

// IMPORTANT: More specific routes must come before parameterized routes

// PUBLIC MEAL ROUTES (browsing shared recipes)
// GET /api/meals/public - Browse public meals with filters
router.get('/public', MealsController.getPublicMeals);

// GET /api/meals/public/top - Get top N public meals
router.get('/public/top', MealsController.getTopPublicMeals);

// GET /api/meals/public/search - Search public meals with filters
router.get('/public/search', MealsController.searchPublicMeals);

// GET /api/meals/public/:id/check - Check if public meal exists in user's collection
router.get('/public/:id/check', MealsController.checkPublicMeal);

// POST /api/meals/public/:id/add - Copy public meal to user's collection
router.post('/public/:id/add', MealsController.addPublicMeal);

// GET /api/meals/public/:id - Get single public meal with ingredients
router.get('/public/:id', MealsController.getPublicMealById);

// PRIVATE MEAL ROUTES (user's personal collection)
// GET /api/meals - Get all private meals with optional filtering
router.get('/', MealsController.getAllMeals);

// GET /api/meals/:id - Get single private meal
router.get('/:id', MealsController.getMealById);

// POST /api/meals - Create new private meal
router.post('/', MealsController.createMeal);

// PUT /api/meals/:id - Update private meal
router.put('/:id', MealsController.updateMeal);

// DELETE /api/meals/:id - Delete private meal
router.delete('/:id', MealsController.deleteMeal);

module.exports = router;
