// client/src/pages/MealsPage/MealsPage.jsx - COMPLETE REPLACEMENT
import React, { useState, useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Clock, Users, AlertCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { useMeals } from '../../hooks/useMeals';
import { useViewMeals } from '../../hooks/useViewMeals';
import MealForm from '../../components/meals/MealForm/MealForm';
import MealDetailModal from '../../components/meals/MealDetailModal/MealDetailModal';
import DeleteConfirmationModal from '../../components/common/DeleteConfirmationModal';
import './MealsPage.css';

const MealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [showMealForm, setShowMealForm] = useState(false);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const cuisines = ['all', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'French', 'Mediterranean'];

  // Custom delete handlers
  const handleDeleteClick = (meal) => {
    setMealToDelete(meal);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!mealToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMeal(mealToDelete.id);
      setShowDeleteModal(false);
      setMealToDelete(null);
    } catch (error) {
      alert('Failed to delete meal: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMealToDelete(null);
  };

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() || selectedCategory !== 'all' || selectedCuisine !== 'all') {
        fetchMeals({
          search: searchTerm.trim(),
          category: selectedCategory,
          cuisineType: selectedCuisine
        });
      } else {
        fetchMeals();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedCuisine]);

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

        <div className="filters-row">
          <div className="filter-section">
            <Filter size={20} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <Filter size={20} />
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
            >
              <option value="all">All Cuisines</option>
              {cuisines.slice(1).map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine}
                </option>
              ))}
            </select>
          </div>
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
              <div className="meal-badges">
                <span className="badge category-badge">{meal.category}</span>
                {meal.cuisineType && (
                  <span className="badge cuisine-badge">{meal.cuisineType}</span>
                )}
              </div>
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
                onClick={() => handleDeleteClick(meal)}
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
            {searchTerm || selectedCategory !== 'all' || selectedCuisine !== 'all'
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={mealToDelete?.name}
        itemType="recipe"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default MealsPage;