const { GroceryItem } = require('../../models');

class GroceryItemService {
  /**
   * Get all grocery items for a user
   */
  static async getAllItems(userId) {
    const items = await GroceryItem.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return items;
  }

  /**
   * Create a new grocery item
   */
  static async createItem(itemData, userId) {
    const item = await GroceryItem.create({
      ...itemData,
      userId
    });

    return item;
  }

  /**
   * Update a grocery item
   */
  static async updateItem(id, itemData, userId) {
    const item = await GroceryItem.findByPk(id);

    if (!item) {
      throw new Error('Grocery item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Not authorized');
    }

    // Don't allow changing userId
    delete itemData.userId;

    await item.update(itemData);
    return item;
  }

  /**
   * Update grocery item store
   */
  static async updateItemStore(id, store, userId) {
    const item = await GroceryItem.findByPk(id);

    if (!item) {
      throw new Error('Grocery item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Not authorized');
    }

    await item.update({ store });
    return item;
  }

  /**
   * Toggle item completed status
   */
  static async toggleItemCompleted(id, userId) {
    const item = await GroceryItem.findByPk(id);

    if (!item) {
      throw new Error('Grocery item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Not authorized');
    }

    await item.update({ completed: !item.completed });
    return item;
  }

  /**
   * Delete a grocery item
   */
  static async deleteItem(id, userId) {
    const item = await GroceryItem.findByPk(id);

    if (!item) {
      throw new Error('Grocery item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Not authorized');
    }

    await item.destroy();
    return true;
  }

  /**
   * Delete all completed items for a user
   */
  static async clearCompleted(userId) {
    const deletedCount = await GroceryItem.destroy({
      where: {
        userId,
        completed: true
      }
    });

    return deletedCount;
  }

  /**
   * Delete all items for a user
   */
  static async clearAll(userId) {
    const deletedCount = await GroceryItem.destroy({
      where: { userId }
    });

    return deletedCount;
  }
}

module.exports = GroceryItemService;
