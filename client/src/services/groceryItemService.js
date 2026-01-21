import api from './api';

class GroceryItemService {
  // Get all grocery items for user
  static async getAllItems() {
    try {
      const response = await api.get('/grocery-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching grocery items:', error);
      throw new Error('Failed to fetch grocery items');
    }
  }

  // Create a new grocery item
  static async createItem(itemData) {
    try {
      const response = await api.post('/grocery-items', itemData);
      return response.data;
    } catch (error) {
      console.error('Error creating grocery item:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.details?.join(', ') || 'Invalid item data');
      }
      throw new Error('Failed to create grocery item');
    }
  }

  // Update a grocery item
  static async updateItem(id, itemData) {
    try {
      const response = await api.patch(`/grocery-items/${id}`, itemData);
      return response.data;
    } catch (error) {
      console.error('Error updating grocery item:', error);
      if (error.response?.status === 404) {
        throw new Error('Grocery item not found');
      }
      if (error.response?.status === 403) {
        throw new Error('Not authorized to update this item');
      }
      throw new Error('Failed to update grocery item');
    }
  }

  // Update grocery item store
  static async updateItemStore(id, store) {
    try {
      const response = await api.patch(`/grocery-items/${id}/store`, { store });
      return response.data;
    } catch (error) {
      console.error('Error updating grocery item store:', error);
      if (error.response?.status === 404) {
        throw new Error('Grocery item not found');
      }
      if (error.response?.status === 403) {
        throw new Error('Not authorized to update this item');
      }
      throw new Error('Failed to update grocery item store');
    }
  }

  // Toggle item completed status
  static async toggleItemCompleted(id) {
    try {
      const response = await api.patch(`/grocery-items/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling grocery item:', error);
      if (error.response?.status === 404) {
        throw new Error('Grocery item not found');
      }
      throw new Error('Failed to toggle grocery item');
    }
  }

  // Delete a grocery item
  static async deleteItem(id) {
    try {
      await api.delete(`/grocery-items/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting grocery item:', error);
      if (error.response?.status === 404) {
        throw new Error('Grocery item not found');
      }
      throw new Error('Failed to delete grocery item');
    }
  }

  // Clear all completed items
  static async clearCompleted() {
    try {
      const response = await api.delete('/grocery-items/completed');
      return response.data;
    } catch (error) {
      console.error('Error clearing completed items:', error);
      throw new Error('Failed to clear completed items');
    }
  }
}

export default GroceryItemService;
