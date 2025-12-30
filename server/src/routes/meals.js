const express = require('express');
const MealsController = require('../controllers/mealsController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// IMPORTANT: More specific routes must come before parameterized routes

// PUBLIC MEAL ROUTES (browsing shared recipes - no auth required, but enhanced with auth)
// GET /api/meals/public - Browse public meals with filters
router.get('/public', optionalAuth, MealsController.getPublicMeals);

// GET /api/meals/public/top - Get top N public meals
router.get('/public/top', optionalAuth, MealsController.getTopPublicMeals);

// GET /api/meals/public/search - Search public meals with filters
router.get('/public/search', optionalAuth, MealsController.searchPublicMeals);

// GET /api/meals/public/:id/check - Check if public meal exists in user's collection (requires auth)
router.get('/public/:id/check', authenticate, MealsController.checkPublicMeal);

// POST /api/meals/public/:id/add - Copy public meal to user's collection (requires auth)
router.post('/public/:id/add', authenticate, MealsController.addPublicMeal);

// GET /api/meals/public/:id - Get single public meal with ingredients
router.get('/public/:id', optionalAuth, MealsController.getPublicMealById);

// PRIVATE MEAL ROUTES (user's personal collection - all require authentication)
// GET /api/meals - Get all private meals with optional filtering
router.get('/', authenticate, MealsController.getAllMeals);

// GET /api/meals/:id - Get single private meal
router.get('/:id', authenticate, MealsController.getMealById);

// POST /api/meals - Create new private meal
router.post('/', authenticate, MealsController.createMeal);

// PUT /api/meals/:id - Update private meal
router.put('/:id', authenticate, MealsController.updateMeal);

// DELETE /api/meals/:id - Delete private meal
router.delete('/:id', authenticate, MealsController.deleteMeal);

module.exports = router;
