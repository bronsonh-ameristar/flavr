const GroceryItemService = require('../services/groceryItemService');

class GroceryItemsController {
  /**
   * Get all grocery items for the current user
   */
  static async getAllItems(req, res) {
    try {
      const userId = req.userId;
      const items = await GroceryItemService.getAllItems(userId);

      res.json({
        data: items,
        success: true
      });
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      res.status(500).json({
        error: 'Failed to fetch grocery items',
        success: false
      });
    }
  }

  /**
   * Create a new grocery item
   */
  static async createItem(req, res) {
    try {
      const userId = req.userId;
      const { name, quantity, unit, category, store } = req.body;

      if (!name) {
        return res.status(400).json({
          error: 'Item name is required',
          success: false
        });
      }

      const item = await GroceryItemService.createItem({
        name,
        quantity: quantity || '1',
        unit,
        category: category || 'other',
        store: store || 'Unassigned'
      }, userId);

      res.status(201).json({
        data: item,
        success: true
      });
    } catch (error) {
      console.error('Error creating grocery item:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to create grocery item',
        success: false
      });
    }
  }

  /**
   * Update a grocery item
   */
  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;
      const itemData = req.body;

      const item = await GroceryItemService.updateItem(id, itemData, userId);

      res.json({
        data: item,
        success: true
      });
    } catch (error) {
      console.error('Error updating grocery item:', error);

      if (error.message === 'Grocery item not found') {
        return res.status(404).json({
          error: 'Grocery item not found',
          success: false
        });
      }

      if (error.message === 'Not authorized') {
        return res.status(403).json({
          error: 'Not authorized to update this item',
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to update grocery item',
        success: false
      });
    }
  }

  /**
   * Update grocery item store
   */
  static async updateItemStore(req, res) {
    try {
      const { id } = req.params;
      const { store } = req.body;
      const userId = req.userId;

      if (!store) {
        return res.status(400).json({
          error: 'Store name is required',
          success: false
        });
      }

      const item = await GroceryItemService.updateItemStore(id, store, userId);

      res.json({
        data: item,
        success: true
      });
    } catch (error) {
      console.error('Error updating grocery item store:', error);

      if (error.message === 'Grocery item not found') {
        return res.status(404).json({
          error: 'Grocery item not found',
          success: false
        });
      }

      if (error.message === 'Not authorized') {
        return res.status(403).json({
          error: 'Not authorized to update this item',
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to update grocery item store',
        success: false
      });
    }
  }

  /**
   * Toggle item completed status
   */
  static async toggleItemCompleted(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const item = await GroceryItemService.toggleItemCompleted(id, userId);

      res.json({
        data: item,
        success: true
      });
    } catch (error) {
      console.error('Error toggling grocery item:', error);

      if (error.message === 'Grocery item not found') {
        return res.status(404).json({
          error: 'Grocery item not found',
          success: false
        });
      }

      if (error.message === 'Not authorized') {
        return res.status(403).json({
          error: 'Not authorized to update this item',
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to toggle grocery item',
        success: false
      });
    }
  }

  /**
   * Delete a grocery item
   */
  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await GroceryItemService.deleteItem(id, userId);

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting grocery item:', error);

      if (error.message === 'Grocery item not found') {
        return res.status(404).json({
          error: 'Grocery item not found',
          success: false
        });
      }

      if (error.message === 'Not authorized') {
        return res.status(403).json({
          error: 'Not authorized to delete this item',
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to delete grocery item',
        success: false
      });
    }
  }

  /**
   * Clear all completed items
   */
  static async clearCompleted(req, res) {
    try {
      const userId = req.userId;
      const deletedCount = await GroceryItemService.clearCompleted(userId);

      res.json({
        deletedCount,
        success: true
      });
    } catch (error) {
      console.error('Error clearing completed items:', error);
      res.status(500).json({
        error: 'Failed to clear completed items',
        success: false
      });
    }
  }
}

module.exports = GroceryItemsController;
