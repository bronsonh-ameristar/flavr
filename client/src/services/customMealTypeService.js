import api from './api';

const customMealTypeService = {
  // Get all custom meal types for the current user
  async getCustomMealTypes() {
    const response = await api.get('/custom-meal-types');
    return response.data;
  },

  // Create a new custom meal type
  async createCustomMealType(name) {
    const response = await api.post('/custom-meal-types', { name });
    return response.data;
  },

  // Update a custom meal type
  async updateCustomMealType(id, data) {
    const response = await api.put(`/custom-meal-types/${id}`, data);
    return response.data;
  },

  // Delete a custom meal type
  async deleteCustomMealType(id) {
    const response = await api.delete(`/custom-meal-types/${id}`);
    return response.data;
  },

  // Reorder custom meal types
  async reorderCustomMealTypes(orderedIds) {
    const response = await api.post('/custom-meal-types/reorder', { orderedIds });
    return response.data;
  }
};

export default customMealTypeService;
