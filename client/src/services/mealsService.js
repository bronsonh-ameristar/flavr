// client/src/services/mealsService.js
import api from './api';

class MealsService {
  // Get all meals with optional filtering
  static async getAllMeals(params = {}) {
    try {
      const response = await api.get('/meals', { params });
      return {
        meals: response.data.meals || [],
        totalCount: response.data.totalCount || 0,
        hasMore: response.data.hasMore || false
      };
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw new Error('Failed to fetch meals');
    }
  }

  // Get single meal by ID
  static async getMealById(id) {
    try {
      const response = await api.get(`/meals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meal:', error);
      if (error.response?.status === 404) {
        throw new Error('Meal not found');
      }
      throw new Error('Failed to fetch meal');
    }
  }

  // Create new meal
  static async createMeal(mealData) {
    try {
      const response = await api.post('/meals', mealData);
      return response.data;
    } catch (error) {
      console.error('Error creating meal:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.details?.join(', ') || 'Invalid meal data');
      }
      throw new Error('Failed to create meal');
    }
  }

  // Update existing meal
  static async updateMeal(id, mealData) {
    try {
      const response = await api.put(`/meals/${id}`, mealData);
      return response.data;
    } catch (error) {
      console.error('Error updating meal:', error);
      if (error.response?.status === 404) {
        throw new Error('Meal not found');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.details?.join(', ') || 'Invalid meal data');
      }
      throw new Error('Failed to update meal');
    }
  }

  // Delete meal
  static async deleteMeal(id) {
    try {
      await api.delete(`/meals/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting meal:', error);
      if (error.response?.status === 404) {
        throw new Error('Meal not found');
      }
      throw new Error('Failed to delete meal');
    }
  }

  // Search meals
  static async searchMeals(searchTerm, category = 'all') {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (category !== 'all') params.category = category;

      return await this.getAllMeals(params);
    } catch (error) {
      console.error('Error searching meals:', error);
      throw new Error('Failed to search meals');
    }
  }

  // Update ingredient store assignment
  static async updateIngredientStore(ingredientId, store) {
    try {
      const response = await api.patch(`/meals/ingredients/${ingredientId}/store`, { store });
      return response.data;
    } catch (error) {
      console.error('Error updating ingredient store:', error);
      if (error.response?.status === 404) {
        throw new Error('Ingredient not found');
      }
      if (error.response?.status === 403) {
        throw new Error('Not authorized to update this ingredient');
      }
      throw new Error('Failed to update ingredient store');
    }
  }
}

export default MealsService;