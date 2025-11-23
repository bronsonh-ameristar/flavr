import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useSearchMeals = () => {
  const [searchMeals, setSearchMeals] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch top N meals (default 10)
  const fetchTopMeals = useCallback(async (limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/search-meals/top`, {
        params: { limit }
      });
      
      // Handle response - backend now returns response.data.data
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

  // Search global meals with filters
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

      const response = await axios.get(`${API_URL}/search-meals/search`, {
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

  // Add a search meal to personal meals
  const addMealToPersonal = useCallback(async (searchMealId) => {
    try {
      const response = await axios.post(`${API_URL}/meals/global/${searchMealId}/add`);
      return response.data?.meal || response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to add meal to personal list';
      throw new Error(errorMessage);
    }
  }, []);

  // Check if a meal is already in personal list
  const checkMealInPersonal = useCallback(async (searchMealId) => {
    try {
      const response = await axios.get(`${API_URL}/meals/global/${searchMealId}/check`);
      return response.data?.hasMeal || false;
    } catch (err) {
      console.error('Error checking meal:', err);
      return false;
    }
  }, []);

  // Get a single search meal by ID
  const getSearchMealById = useCallback(async (searchMealId) => {
    try {
      const response = await axios.get(`${API_URL}/search-meals/${searchMealId}`);
      return response.data?.data || response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch meal details';
      throw new Error(errorMessage);
    }
  }, []);

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
    clearSearch
  };
};