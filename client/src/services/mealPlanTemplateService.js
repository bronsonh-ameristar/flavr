import api from './api';

const mealPlanTemplateService = {
  // Get all templates for the current user
  async getTemplates() {
    const response = await api.get('/meal-plan-templates');
    return response.data;
  },

  // Get a single template by ID
  async getTemplate(id) {
    const response = await api.get(`/meal-plan-templates/${id}`);
    return response.data;
  },

  // Create a new template
  async createTemplate(data) {
    const response = await api.post('/meal-plan-templates', data);
    return response.data;
  },

  // Update a template
  async updateTemplate(id, data) {
    const response = await api.put(`/meal-plan-templates/${id}`, data);
    return response.data;
  },

  // Delete a template
  async deleteTemplate(id) {
    const response = await api.delete(`/meal-plan-templates/${id}`);
    return response.data;
  },

  // Apply a template to a week
  async applyTemplate(id, startDate, overwrite = false) {
    const response = await api.post(`/meal-plan-templates/${id}/apply`, { startDate, overwrite });
    return response.data;
  },

  // Copy a week of meal plans
  async copyWeek(sourceStartDate, targetStartDate, overwrite = false) {
    const response = await api.post('/meal-plans/copy-week', {
      sourceStartDate,
      targetStartDate,
      overwrite
    });
    return response.data;
  },

  // Save a week as a template
  async saveWeekAsTemplate(weekStartDate, templateName) {
    const response = await api.post('/meal-plans/save-as-template', {
      weekStartDate,
      templateName
    });
    return response.data;
  }
};

export default mealPlanTemplateService;
