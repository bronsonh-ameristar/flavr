const express = require('express');
const MealsController = require('../controllers/mealsController');
const router = express.Router();

// IMPORTANT: More specific routes must come before parameterized routes
// Place /global routes BEFORE /:id route to avoid conflicts

// GET /api/meals/global/:id/check - Check if global meal exists in personal collection
router.get('/global/:id/check', MealsController.checkGlobalMeal);

// POST /api/meals/global/:id/add - Add global meal to personal collection
router.post('/global/:id/add', MealsController.addGlobalMeal);

// GET /api/meals - Get all meals with optional filtering
router.get('/', MealsController.getAllMeals);

// GET /api/meals/:id - Get single meal
router.get('/:id', MealsController.getMealById);

// POST /api/meals - Create new meal
router.post('/', MealsController.createMeal);

// PUT /api/meals/:id - Update meal
router.put('/:id', MealsController.updateMeal);

// DELETE /api/meals/:id - Delete meal
router.delete('/:id', MealsController.deleteMeal);

module.exports = router;