import api from './api';

class MealPlanningService {
  // Get meal plans for a date range
  static async getMealPlans(startDate, endDate) {
    try {
      const response = await api.get('/meal-plans', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      throw new Error('Failed to fetch meal plans');
    }
  }

  // Add meal to plan
  static async addMealToPlan(date, mealType, mealId) {
    try {
      const response = await api.post('/meal-plans', {
        date,
        mealType,
        mealId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding meal to plan:', error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.details?.join(', ') || 'Invalid meal plan data');
      }
      throw new Error('Failed to add meal to plan');
    }
  }

  // Remove meal from plan
  static async removeMealFromPlan(date, mealType) {
    try {
      await api.delete(`/meal-plans/${date}/${mealType}`);
      return true;
    } catch (error) {
      console.error('Error removing meal from plan:', error);
      if (error.response?.status === 404) {
        throw new Error('Meal plan not found');
      }
      throw new Error('Failed to remove meal from plan');
    }
  }

  // Generate grocery list
  static async generateGroceryList(startDate, endDate) {
    try {
      const response = await api.get('/meal-plans/grocery-list', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating grocery list:', error);
      throw new Error('Failed to generate grocery list');
    }
  }

  // Get meal plan statistics
  static async getMealPlanStats(startDate, endDate) {
    try {
      const response = await api.get('/meal-plans/stats', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching meal plan stats:', error);
      throw new Error('Failed to fetch meal plan statistics');
    }
  }
}

export default MealPlanningService;