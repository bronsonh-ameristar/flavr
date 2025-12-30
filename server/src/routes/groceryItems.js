const express = require('express');
const GroceryItemsController = require('../controllers/groceryItemsController');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication

// GET /api/grocery-items - Get all grocery items for user
router.get('/', authenticate, GroceryItemsController.getAllItems);

// POST /api/grocery-items - Create a new grocery item
router.post('/', authenticate, GroceryItemsController.createItem);

// DELETE /api/grocery-items/completed - Clear all completed items (must be before :id route)
router.delete('/completed', authenticate, GroceryItemsController.clearCompleted);

// PATCH /api/grocery-items/:id - Update a grocery item
router.patch('/:id', authenticate, GroceryItemsController.updateItem);

// PATCH /api/grocery-items/:id/store - Update item store
router.patch('/:id/store', authenticate, GroceryItemsController.updateItemStore);

// PATCH /api/grocery-items/:id/toggle - Toggle item completed status
router.patch('/:id/toggle', authenticate, GroceryItemsController.toggleItemCompleted);

// DELETE /api/grocery-items/:id - Delete a grocery item
router.delete('/:id', authenticate, GroceryItemsController.deleteItem);

module.exports = router;
