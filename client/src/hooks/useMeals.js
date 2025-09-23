// client/src/hooks/useMeals.js
import { useState, useEffect, useCallback } from 'react';
import MealsService from '../services/mealsService';

export const useMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch all meals
  const fetchMeals = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await MealsService.getAllMeals(params);
      setMeals(result.meals);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (error) {
      setError(error.message);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search meals
  const searchMeals = useCallback(async (searchTerm, category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      const result = await MealsService.searchMeals(searchTerm, category);
      setMeals(result.meals);
      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
    } catch (error) {
      setError(error.message);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create meal
  const createMeal = useCallback(async (mealData) => {
    try {
      const newMeal = await MealsService.createMeal(mealData);
      setMeals(prevMeals => [newMeal, ...prevMeals]);
      setTotalCount(prev => prev + 1);
      return newMeal;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Update meal
  const updateMeal = useCallback(async (id, mealData) => {
    try {
      const updatedMeal = await MealsService.updateMeal(id, mealData);
      setMeals(prevMeals => 
        prevMeals.map(meal => meal.id === id ? updatedMeal : meal)
      );
      return updatedMeal;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Delete meal
  const deleteMeal = useCallback(async (id) => {
    try {
      await MealsService.deleteMeal(id);
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  // Load meals on mount
  useEffect(() => {
    fetchMeals();
  }, []); // Remove fetchMeals from dependencies to prevent infinite loop

  return {
    meals,
    loading,
    error,
    totalCount,
    hasMore,
    fetchMeals,
    searchMeals,
    createMeal,
    updateMeal,
    deleteMeal,
    refetch: fetchMeals
  };
};

export const useMeal = (id) => {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchMeal = async () => {
      try {
        setLoading(true);
        setError(null);
        const mealData = await MealsService.getMealById(id);
        setMeal(mealData);
      } catch (error) {
        setError(error.message);
        setMeal(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id]);

  return { meal, loading, error };
};