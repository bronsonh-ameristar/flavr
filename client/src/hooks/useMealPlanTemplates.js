import { useState, useCallback } from 'react';
import mealPlanTemplateService from '../services/mealPlanTemplateService';

export const useMealPlanTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.getTemplates();
      setTemplates(response.templates || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.getTemplate(id);
      return response.template;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.createTemplate(data);
      await fetchTemplates();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.updateTemplate(id, data);
      await fetchTemplates();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await mealPlanTemplateService.deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const applyTemplate = useCallback(async (id, startDate, overwrite = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.applyTemplate(id, startDate, overwrite);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const copyWeek = useCallback(async (sourceStartDate, targetStartDate, overwrite = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.copyWeek(sourceStartDate, targetStartDate, overwrite);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWeekAsTemplate = useCallback(async (weekStartDate, templateName) => {
    try {
      setLoading(true);
      setError(null);
      const response = await mealPlanTemplateService.saveWeekAsTemplate(weekStartDate, templateName);
      await fetchTemplates();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    copyWeek,
    saveWeekAsTemplate
  };
};
