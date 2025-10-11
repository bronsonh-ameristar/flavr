// client/src/pages/MealsPage/MealsPage.jsx - COMPLETE REPLACEMENT
import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Clock, Users, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useMeals } from '../../hooks/useMeals';
import { useViewMeals } from '../../hooks/useViewMeals';
import MealForm from '../../components/meals/MealForm/MealForm';
import MealDetailModal from '../../components/meals/MealDetailModal/MealDetailModal';
import './MealsPage.css';

const MealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMealForm, setShowMealForm] = useState(false);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    meals, 
    loading, 
    error, 
    totalCount, 
    fetchMeals,
    searchMeals, 
    createMeal,
    updateMeal,
    deleteMeal 
  } = useMeals();

  const {
    handleDeleteMeal,
    handleAddMeal,
    handleEditMeal,
    handleViewMeal,
    handleSaveMeal,
    handleCancelForm,
    handleRetry
  } = useViewMeals({
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
  });

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() || selectedCategory !== 'all') {
        searchMeals(searchTerm.trim(), selectedCategory);
      } else {
        fetchMeals();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  // const handleDeleteMeal = async (mealId, mealName) => {
  //   if (window.confirm(`Are you sure you want to delete "${mealName}"?`)) {
  //     try {
  //       await deleteMeal(mealId);
  //     } catch (error) {
  //       alert('Failed to delete meal: ' + error.message);
  //     }
  //   }
  // };

  // const handleAddMeal = () => {
  //   setEditingMeal(null);
  //   setShowMealForm(true);
  // };

  // const handleEditMeal = (meal) => {
  //   setEditingMeal(meal);
  //   setShowMealForm(true);
  // };

  // const handleViewMeal = (meal) => {
  //   setViewingMeal(meal);
  //   setShowMealDetail(true);
  // };

  // const handleSaveMeal = async (mealData) => {
  //   setIsSubmitting(true);
  //   try {
  //     if (editingMeal) {
  //       await updateMeal(editingMeal.id, mealData);
  //     } else {
  //       await createMeal(mealData);
  //     }
  //     setShowMealForm(false);
  //     setEditingMeal(null);
  //   } catch (error) {
  //     throw error;
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  // const handleCancelForm = () => {
  //   setShowMealForm(false);
  //   setEditingMeal(null);
  // };

  // const handleRetry = () => {
  //   if (searchTerm.trim() || selectedCategory !== 'all') {
  //     searchMeals(searchTerm.trim(), selectedCategory);
  //   } else {
  //     fetchMeals();
  //   }
  // };

  if (loading && meals.length === 0) {
    return (
      <div className="meals-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="meals-page">
      <div className="meals-header">
        <h1>Your Recipes ({totalCount})</h1>
        <button className="add-meal-btn" onClick={handleAddMeal}>
          <Plus size={20} />
          Add New Recipe
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>Error: {error}</span>
          <button onClick={handleRetry} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      <div className="meals-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="meals-grid">
        {meals.map(meal => (
          <div key={meal.id} className="meal-card">
            <div className="meal-image">
              <img 
                src={meal.imageUrl || `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(meal.name)}`} 
                alt={meal.name}
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = 'true';
                    e.target.src = `https://via.placeholder.com/300x200/e2e8f0/64748b?text=${encodeURIComponent(meal.name)}`;
                  }
                }}
              />
              <div className="meal-category">{meal.category}</div>
            </div>
            
            <div className="meal-content">
              <h3>{meal.name}</h3>
              <p>{meal.description || 'No description available'}</p>
              
              <div className="meal-meta">
                <div className="meta-item">
                  <Clock size={16} />
                  <span>{meal.totalTime || (meal.prepTime + meal.cookTime) || 0} min</span>
                </div>
                <div className="meta-item">
                  <Users size={16} />
                  <span>{meal.servings} servings</span>
                </div>
                {meal.difficulty && (
                  <div className="meta-item">
                    <span className={`difficulty ${meal.difficulty}`}>
                      {meal.difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="meal-actions">
                <button 
                  className="btn-icon btn-view"
                  onClick={() => handleViewMeal(meal)}
                  title="View Recipe"
                >
                  <Eye size={18} />
                </button>
                <button 
                  className="btn-icon btn-edit"
                  onClick={() => handleEditMeal(meal)}
                  title="Edit Recipe"
                >
                  <Edit size={18} />
                </button>
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteMeal(meal.id, meal.name)}
                  title="Delete Recipe"
                >
                  <Trash2 size={18} />
                </button>
              </div>
          </div>
        ))}
      </div>

      {meals.length === 0 && !loading && !error && (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Add your first recipe to get started!'
            }
          </p>
          <button className="add-meal-btn" onClick={handleAddMeal}>
            <Plus size={20} />
            Add Your First Recipe
          </button>
        </div>
      )}

      {loading && meals.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {showMealForm && (
        <MealForm
          meal={editingMeal}
          onSave={handleSaveMeal}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}

      {showMealDetail && viewingMeal && (
        <MealDetailModal
          meal={viewingMeal}
          onClose={() => {
            setShowMealDetail(false);
            setViewingMeal(null);
          }}
          onEdit={(meal) => {
            setShowMealDetail(false);
            setViewingMeal(null);
            handleEditMeal(meal);
          }}
        />
      )}
    </div>
  );
};

export default MealsPage;