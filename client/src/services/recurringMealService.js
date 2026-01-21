import api from './api';

const recurringMealService = {
  // Get all recurring meals for the current user
  async getRecurringMeals() {
    const response = await api.get('/recurring-meals');
    return response.data;
  },

  // Create a new recurring meal
  async createRecurringMeal(data) {
    const response = await api.post('/recurring-meals', data);
    return response.data;
  },

  // Update a recurring meal
  async updateRecurringMeal(id, data) {
    const response = await api.put(`/recurring-meals/${id}`, data);
    return response.data;
  },

  // Delete a recurring meal
  async deleteRecurringMeal(id) {
    const response = await api.delete(`/recurring-meals/${id}`);
    return response.data;
  },

  // Apply recurring meals to a date range
  async applyRecurringMeals(startDate, endDate) {
    const response = await api.post('/recurring-meals/apply', { startDate, endDate });
    return response.data;
  }
};

export default recurringMealService;
