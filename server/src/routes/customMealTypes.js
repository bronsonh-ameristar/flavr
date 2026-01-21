const express = require('express');
const router = express.Router();
const CustomMealTypesController = require('../controllers/customMealTypesController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// GET /api/custom-meal-types - List user's custom meal types
router.get('/', CustomMealTypesController.getCustomMealTypes);

// POST /api/custom-meal-types - Create custom meal type
router.post('/', CustomMealTypesController.createCustomMealType);

// PUT /api/custom-meal-types/:id - Update custom meal type
router.put('/:id', CustomMealTypesController.updateCustomMealType);

// DELETE /api/custom-meal-types/:id - Delete custom meal type
router.delete('/:id', CustomMealTypesController.deleteCustomMealType);

// POST /api/custom-meal-types/reorder - Reorder custom meal types
router.post('/reorder', CustomMealTypesController.reorderCustomMealTypes);

module.exports = router;
