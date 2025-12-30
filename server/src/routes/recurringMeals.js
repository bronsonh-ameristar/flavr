const express = require('express');
const router = express.Router();
const RecurringMealsController = require('../controllers/recurringMealsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/recurring-meals - List user's recurring meals
router.get('/', RecurringMealsController.getRecurringMeals);

// POST /api/recurring-meals - Create recurring meal
router.post('/', RecurringMealsController.createRecurringMeal);

// PUT /api/recurring-meals/:id - Update recurring meal
router.put('/:id', RecurringMealsController.updateRecurringMeal);

// DELETE /api/recurring-meals/:id - Delete recurring meal
router.delete('/:id', RecurringMealsController.deleteRecurringMeal);

// POST /api/recurring-meals/apply - Apply recurring meals to date range
router.post('/apply', RecurringMealsController.applyRecurringMeals);

module.exports = router;
