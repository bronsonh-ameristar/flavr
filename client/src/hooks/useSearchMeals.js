import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useSearchMeals = () => {
  const [searchMeals, setSearchMeals] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch top N public meals (default 10)
  const fetchTopMeals = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/meals/public/top`, {
        params: { limit }
      });

      // Handle response - backend returns response.data.data
      const meals = response.data?.data || [];
      const count = response.data?.totalCount || meals.length;

      setSearchMeals(meals);
      setTotalCount(count);

      return meals;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch meals';
      setError(errorMessage);
      console.error('Error fetching top meals:', err);
      setSearchMeals([]); // Set to empty array on error
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Search public meals with filters
  const searchGlobalMeals = useCallback(async ({
    search = '',
    category = 'all',
    cuisineType = 'all',
    difficulty = 'all',
    maxPrepTime = null,
    maxCookTime = null,
    limit = 20,
    offset = 0
  } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit, offset };

      // Only add parameters if they have values
      if (search) params.search = search;
      if (category && category !== 'all') params.category = category;
      if (cuisineType && cuisineType !== 'all') params.cuisineType = cuisineType;
      if (difficulty && difficulty !== 'all') params.difficulty = difficulty;
      if (maxPrepTime) params.maxPrepTime = maxPrepTime;
      if (maxCookTime) params.maxCookTime = maxCookTime;

      const response = await axios.get(`${API_URL}/meals/public/search`, {
        params
      });

      // Handle response
      const meals = response.data?.data || [];
      const count = response.data?.totalCount || meals.length;
      const hasMore = response.data?.hasMore || false;

      setSearchMeals(meals);
      setTotalCount(count);

      return { meals, totalCount: count, hasMore };
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to search meals';
      setError(errorMessage);
      console.error('Error searching meals:', err);
      setSearchMeals([]); // Set to empty array on error
      return { meals: [], totalCount: 0, hasMore: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a public meal to user's personal collection
  const addMealToPersonal = useCallback(async (mealId) => {
    try {
      const response = await axios.post(`${API_URL}/meals/public/${mealId}/add`);
      return response.data?.meal || response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add meal to personal list';
      throw new Error(errorMessage);
    }
  }, []);

  // Check if a public meal is already in user's personal collection
  const checkMealInPersonal = useCallback(async (mealId) => {
    try {
      const response = await axios.get(`${API_URL}/meals/public/${mealId}/check`);
      return response.data?.hasMeal || false;
    } catch (err) {
      console.error('Error checking meal:', err);
      return false;
    }
  }, []);

  // Get a single public meal by ID
  const getSearchMealById = useCallback(async (mealId) => {
    try {
      const response = await axios.get(`${API_URL}/meals/public/${mealId}`);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch meal details';
      throw new Error(errorMessage);
    }
  }, []);

  // Alias for getSearchMealById for clarity
  const getPublicMealById = getSearchMealById;

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchMeals([]);
    setTotalCount(0);
    setError(null);
  }, []);

  return {
    searchMeals,
    loading,
    error,
    totalCount,
    fetchTopMeals,
    searchGlobalMeals,
    addMealToPersonal,
    checkMealInPersonal,
    getSearchMealById,
    getPublicMealById,
    clearSearch
  };
};
