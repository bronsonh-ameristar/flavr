const express = require('express');
const router = express.Router();
const MealPlanTemplatesController = require('../controllers/mealPlanTemplatesController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/meal-plan-templates - List user's templates
router.get('/', MealPlanTemplatesController.getTemplates);

// POST /api/meal-plan-templates - Create template
router.post('/', MealPlanTemplatesController.createTemplate);

// GET /api/meal-plan-templates/:id - Get template with items
router.get('/:id', MealPlanTemplatesController.getTemplate);

// PUT /api/meal-plan-templates/:id - Update template
router.put('/:id', MealPlanTemplatesController.updateTemplate);

// DELETE /api/meal-plan-templates/:id - Delete template
router.delete('/:id', MealPlanTemplatesController.deleteTemplate);

// POST /api/meal-plan-templates/:id/apply - Apply template to week
router.post('/:id/apply', MealPlanTemplatesController.applyTemplate);

module.exports = router;
