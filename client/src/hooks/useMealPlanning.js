import { useState, useCallback } from 'react';
import MealPlanningService from '../services/mealPlanningService';

export const useMealPlanning = (startDate, endDate) => {
  const [mealPlans, setMealPlans] = useState({});
  const [groceryList, setGroceryList] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch meal plans for the date range
  const fetchMealPlans = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await MealPlanningService.getMealPlans(startDate, endDate);
      setMealPlans(data.mealPlans || {});
    } catch (error) {
      setError(error.message);
      setMealPlans({});
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Add meal to plan
  const addMealToPlan = useCallback(async (date, mealType, mealId) => {
    try {
      const response = await MealPlanningService.addMealToPlan(date, mealType, mealId);
      const key = `${date}-${mealType}`;
      
      setMealPlans(prev => ({
        ...prev,
        [key]: {
          id: response.mealPlan.id,
          date: response.mealPlan.date,
          mealType: response.mealPlan.mealType,
          meal: response.mealPlan.meal
        }
      }));
      
      return response.mealPlan;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Remove meal from plan
  const removeMealFromPlan = useCallback(async (date, mealType) => {
    try {
      await MealPlanningService.removeMealFromPlan(date, mealType);
      const key = `${date}-${mealType}`;
      
      setMealPlans(prev => {
        const newPlans = { ...prev };
        delete newPlans[key];
        return newPlans;
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Generate grocery list
  const generateGroceryList = useCallback(async () => {
    if (!startDate || !endDate) return;

    try {
      setError(null);
      const data = await MealPlanningService.generateGroceryList(startDate, endDate);
      setGroceryList(data);
      return data;
    } catch (error) {
      setError(error.message);
      // Don't re-throw - let the hook handle errors via state
    }
  }, [startDate, endDate]);

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    try {
      const data = await MealPlanningService.getMealPlanStats(startDate, endDate);
      setStats(data);
    } catch (error) {
      setError(error.message);
    }
  }, [startDate, endDate]);

  // Note: Auto-fetch removed - components should call fetchMealPlans explicitly
  // This prevents 401 errors when hook is mounted before auth is verified

  return {
    mealPlans,
    groceryList,
    stats,
    loading,
    error,
    addMealToPlan,
    removeMealFromPlan,
    generateGroceryList,
    fetchMealPlans,
    fetchStats,
    refetch: fetchMealPlans
  };
};