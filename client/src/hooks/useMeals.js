import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useMeals = () => {
  const [meals, setMeals] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch all personal meals with optional filters
  const fetchMeals = useCallback(async ({ 
    category = 'all', 
    search = '', 
    limit = 50, 
    offset = 0 
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit, offset };
      
      if (category && category !== 'all') params.category = category;
      if (search) params.search = search;

      const response = await axios.get(`${API_URL}/meals`, { params });
      
      // Handle response - backend now returns response.data.data
      const mealsData = response.data?.data || [];
      const count = response.data?.totalCount || mealsData.length;
      const more = response.data?.hasMore || false;
      
      setMeals(mealsData);
      setTotalCount(count);
      setHasMore(more);
      
      return { meals: mealsData, totalCount: count, hasMore: more };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch meals';
      setError(errorMessage);
      console.error('Error fetching meals:', err);
      setMeals([]); // Set to empty array on error
      return { meals: [], totalCount: 0, hasMore: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single meal by ID
  const getMealById = useCallback(async (mealId) => {
    try {
      const response = await axios.get(`${API_URL}/meals/${mealId}`);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch meal';
      throw new Error(errorMessage);
    }
  }, []);

  // Create a new meal
  const createMeal = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/meals`, mealData);
      const newMeal = response.data?.data || response.data;
      
      // Add to local state
      setMeals(prev => [newMeal, ...prev]);
      setTotalCount(prev => prev + 1);
      
      return newMeal;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create meal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing meal
  const updateMeal = useCallback(async (mealId, mealData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/meals/${mealId}`, mealData);
      const updatedMeal = response.data?.data || response.data;
      
      // Update in local state
      setMeals(prev => 
        prev.map(meal => meal.id === mealId ? updatedMeal : meal)
      );
      
      return updatedMeal;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to update meal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a meal
  const deleteMeal = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/meals/${mealId}`);
      
      // Remove from local state
      setMeals(prev => prev.filter(meal => meal.id !== mealId));
      setTotalCount(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete meal';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear meals (useful for filters/reset)
  const clearMeals = useCallback(() => {
    setMeals([]);
    setTotalCount(0);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    meals,
    loading,
    error,
    totalCount,
    hasMore,
    fetchMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    clearMeals
  };
};