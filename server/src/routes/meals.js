const express = require('express');
const MealsController = require('../controllers/mealsController');
const router = express.Router();

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