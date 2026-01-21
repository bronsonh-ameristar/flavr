import { useState, useCallback, useMemo } from 'react';
import customMealTypeService from '../services/customMealTypeService';

// Default meal types that cannot be deleted
const DEFAULT_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

export const useCustomMealTypes = () => {
  const [customMealTypes, setCustomMealTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch custom meal types from API
  const fetchCustomMealTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customMealTypeService.getCustomMealTypes();
      setCustomMealTypes(response.customMealTypes || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching custom meal types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new custom meal type
  const createCustomMealType = useCallback(async (name) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customMealTypeService.createCustomMealType(name);
      await fetchCustomMealTypes();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomMealTypes]);

  // Delete a custom meal type
  const deleteCustomMealType = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await customMealTypeService.deleteCustomMealType(id);
      await fetchCustomMealTypes();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomMealTypes]);

  // Update a custom meal type
  const updateCustomMealType = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customMealTypeService.updateCustomMealType(id, data);
      await fetchCustomMealTypes();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCustomMealTypes]);

  // Combine default and custom meal types into a single ordered list
  const allMealTypes = useMemo(() => {
    const defaultTypes = DEFAULT_MEAL_TYPES.map(type => ({
      id: null,
      name: type,
      isDefault: true,
      displayOrder: DEFAULT_MEAL_TYPES.indexOf(type)
    }));

    const customTypes = customMealTypes.map(type => ({
      ...type,
      isDefault: false
    }));

    return [...defaultTypes, ...customTypes];
  }, [customMealTypes]);

  // Get just the meal type names for simple usage
  const mealTypeNames = useMemo(() => {
    return allMealTypes.map(t => t.name);
  }, [allMealTypes]);

  return {
    customMealTypes,
    allMealTypes,
    mealTypeNames,
    loading,
    error,
    fetchCustomMealTypes,
    createCustomMealType,
    deleteCustomMealType,
    updateCustomMealType,
    DEFAULT_MEAL_TYPES
  };
};
