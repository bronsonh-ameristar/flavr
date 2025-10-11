// hooks/useMealHandlers.js
import { useCallback } from 'react';

export const useViewMeals = ({
  deleteMeal,
  updateMeal,
  createMeal,
  searchMeals,
  fetchMeals,
  setEditingMeal,
  setShowMealForm,
  setViewingMeal,
  setShowMealDetail,
  setIsSubmitting,
  editingMeal,
  searchTerm,
  selectedCategory
}) => {
  const handleDeleteMeal = useCallback(async (mealId, mealName) => {
    if (window.confirm(`Are you sure you want to delete "${mealName}"?`)) {
      try {
        await deleteMeal(mealId);
      } catch (error) {
        alert('Failed to delete meal: ' + error.message);
      }
    }
  }, [deleteMeal]);

  const handleAddMeal = useCallback(() => {
    setEditingMeal(null);
    setShowMealForm(true);
  }, [setEditingMeal, setShowMealForm]);

  const handleEditMeal = useCallback((meal) => {
    setEditingMeal(meal);
    setShowMealForm(true);
  }, [setEditingMeal, setShowMealForm]);

  const handleViewMeal = useCallback((meal) => {
    setViewingMeal(meal);
    setShowMealDetail(true);
  }, [setViewingMeal, setShowMealDetail]);

  const handleCloseMealDetail = useCallback(() => {
    setShowMealDetail(false);
  }, [setShowMealDetail]);

  const handleSaveMeal = useCallback(async (mealData) => {
    setIsSubmitting(true);
    try {
      if (editingMeal) {
        await updateMeal(editingMeal.id, mealData);
      } else {
        await createMeal(mealData);
      }
      setShowMealForm(false);
      setEditingMeal(null);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [editingMeal, updateMeal, createMeal, setShowMealForm, setEditingMeal, setIsSubmitting]);

  const handleCancelForm = useCallback(() => {
    setShowMealForm(false);
    setEditingMeal(null);
  }, [setShowMealForm, setEditingMeal]);

  const handleRetry = useCallback(() => {
    if (searchTerm.trim() || selectedCategory !== 'all') {
      searchMeals(searchTerm.trim(), selectedCategory);
    } else {
      fetchMeals();
    }
  }, [searchTerm, selectedCategory, searchMeals, fetchMeals]);

  return {
    handleDeleteMeal,
    handleAddMeal,
    handleEditMeal,
    handleViewMeal,
    handleCloseMealDetail,
    handleSaveMeal,
    handleCancelForm,
    handleRetry
  };
};