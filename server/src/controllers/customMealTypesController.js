const { CustomMealType } = require('../../models');

class CustomMealTypesController {
  // Get all custom meal types for the current user
  static async getCustomMealTypes(req, res) {
    try {
      const userId = req.userId;

      const customMealTypes = await CustomMealType.findAll({
        where: { userId, isActive: true },
        order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']]
      });

      res.json({
        customMealTypes,
        count: customMealTypes.length
      });
    } catch (error) {
      console.error('Error fetching custom meal types:', error);
      res.status(500).json({ error: 'Failed to fetch custom meal types' });
    }
  }

  // Create a new custom meal type
  static async createCustomMealType(req, res) {
    try {
      const userId = req.userId;
      const { name } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          error: 'Meal type name is required'
        });
      }

      // Normalize the name (lowercase for storage, but keep original for display)
      const normalizedName = name.trim().toLowerCase();

      // Check if reserved meal type
      const reservedTypes = ['breakfast', 'lunch', 'dinner'];
      if (reservedTypes.includes(normalizedName)) {
        return res.status(400).json({
          error: 'Cannot create a meal type with a reserved name (breakfast, lunch, dinner)'
        });
      }

      // Check if meal type already exists for this user
      const existing = await CustomMealType.findOne({
        where: { userId, name: normalizedName }
      });

      if (existing) {
        if (!existing.isActive) {
          // Reactivate the meal type
          await existing.update({ isActive: true });
          return res.json({
            customMealType: existing,
            reactivated: true
          });
        }
        return res.status(409).json({
          error: 'A meal type with this name already exists'
        });
      }

      // Get the highest display order
      const maxOrder = await CustomMealType.max('displayOrder', {
        where: { userId }
      });

      // Create new custom meal type
      const customMealType = await CustomMealType.create({
        userId,
        name: normalizedName,
        displayOrder: (maxOrder || 0) + 1,
        isActive: true
      });

      res.status(201).json({
        customMealType,
        created: true
      });
    } catch (error) {
      console.error('Error creating custom meal type:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'A meal type with this name already exists'
        });
      }

      res.status(500).json({ error: 'Failed to create custom meal type' });
    }
  }

  // Update a custom meal type
  static async updateCustomMealType(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { name, displayOrder } = req.body;

      const customMealType = await CustomMealType.findOne({
        where: { id, userId }
      });

      if (!customMealType) {
        return res.status(404).json({ error: 'Custom meal type not found' });
      }

      const updateData = {};
      if (name !== undefined) {
        const normalizedName = name.trim().toLowerCase();
        const reservedTypes = ['breakfast', 'lunch', 'dinner'];
        if (reservedTypes.includes(normalizedName)) {
          return res.status(400).json({
            error: 'Cannot use a reserved name (breakfast, lunch, dinner)'
          });
        }
        updateData.name = normalizedName;
      }
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      await customMealType.update(updateData);

      res.json({ customMealType });
    } catch (error) {
      console.error('Error updating custom meal type:', error);
      res.status(500).json({ error: 'Failed to update custom meal type' });
    }
  }

  // Delete (deactivate) a custom meal type
  static async deleteCustomMealType(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const customMealType = await CustomMealType.findOne({
        where: { id, userId }
      });

      if (!customMealType) {
        return res.status(404).json({ error: 'Custom meal type not found' });
      }

      // Soft delete by setting isActive to false
      await customMealType.update({ isActive: false });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting custom meal type:', error);
      res.status(500).json({ error: 'Failed to delete custom meal type' });
    }
  }

  // Reorder custom meal types
  static async reorderCustomMealTypes(req, res) {
    try {
      const userId = req.userId;
      const { orderedIds } = req.body;

      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({
          error: 'orderedIds must be an array of meal type IDs'
        });
      }

      // Update display order for each meal type
      for (let i = 0; i < orderedIds.length; i++) {
        await CustomMealType.update(
          { displayOrder: i + 1 },
          { where: { id: orderedIds[i], userId } }
        );
      }

      // Fetch updated list
      const customMealTypes = await CustomMealType.findAll({
        where: { userId, isActive: true },
        order: [['displayOrder', 'ASC']]
      });

      res.json({
        customMealTypes,
        message: 'Order updated successfully'
      });
    } catch (error) {
      console.error('Error reordering custom meal types:', error);
      res.status(500).json({ error: 'Failed to reorder custom meal types' });
    }
  }
}

module.exports = CustomMealTypesController;
