import { useState, useCallback } from 'react';
import recurringMealService from '../services/recurringMealService';

export const useRecurringMeals = () => {
  const [recurringMeals, setRecurringMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecurringMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recurringMealService.getRecurringMeals();
      setRecurringMeals(response.recurringMeals || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recurring meals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRecurringMeal = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recurringMealService.createRecurringMeal(data);
      // Refetch to get updated list
      await fetchRecurringMeals();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecurringMeals]);

  const updateRecurringMeal = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recurringMealService.updateRecurringMeal(id, data);
      // Refetch to get updated list
      await fetchRecurringMeals();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecurringMeals]);

  const deleteRecurringMeal = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await recurringMealService.deleteRecurringMeal(id);
      // Refetch to get updated list
      await fetchRecurringMeals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecurringMeals]);

  const toggleActive = useCallback(async (id, isActive) => {
    try {
      setLoading(true);
      setError(null);
      await recurringMealService.updateRecurringMeal(id, { isActive: !isActive });
      // Refetch to get updated list
      await fetchRecurringMeals();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchRecurringMeals]);

  const applyRecurringMeals = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recurringMealService.applyRecurringMeals(startDate, endDate);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Group recurring meals by day
  const groupedByDay = recurringMeals.reduce((acc, rm) => {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rm.dayOfWeek];
    if (!acc[dayName]) {
      acc[dayName] = [];
    }
    acc[dayName].push(rm);
    return acc;
  }, {});

  return {
    recurringMeals,
    groupedByDay,
    loading,
    error,
    fetchRecurringMeals,
    createRecurringMeal,
    updateRecurringMeal,
    deleteRecurringMeal,
    toggleActive,
    applyRecurringMeals
  };
};
