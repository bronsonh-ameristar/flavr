import { useState, useCallback } from 'react';
import api from '../services/api';

export const usePrepPlan = () => {
  const [prepPlan, setPrepPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate a prep plan for multiple meals
   * @param {Array} meals - Array of { mealId, servings }
   */
  const generatePlan = useCallback(async (meals) => {
    if (!meals || meals.length === 0) {
      setError('Please select at least one meal');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/meal-plans/prep-plan', { meals });
      setPrepPlan(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate prep plan';
      setError(errorMessage);
      console.error('Error generating prep plan:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the current prep plan
   */
  const clearPlan = useCallback(() => {
    setPrepPlan(null);
    setError(null);
  }, []);

  return {
    prepPlan,
    isLoading,
    error,
    generatePlan,
    clearPlan
  };
};
