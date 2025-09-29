// client/src/pages/MealsPage/MealsPage.jsx - REPLACE ENTIRE FILE
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, Users, AlertCircle } from 'lucide-react';
import { useMeals } from '../../hooks/useMeals';
import './MealsPage.css';

const MealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { 
    meals, 
    loading, 
    error, 
    totalCount, 
    fetchMeals,
    searchMeals, 
    deleteMeal 
  } = useMeals();

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  // Handle search and filter changes
  useEffect(() => {
    // Only search if there's actually a search term or non-default category
    if (searchTerm.trim() || selectedCategory !== 'all') {
      const debounceTimer = setTimeout(() => {
        searchMeals(searchTerm.trim(), selectedCategory);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      // If no search/filter, just fetch all meals
      const debounceTimer = setTimeout(() => {
        fetchMeals();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedCategory]);

  const handleDeleteMeal = async (mealId, mealName) => {
    if (window.confirm(`Are you sure you want to delete "${mealName}"?`)) {
      try {
        await deleteMeal(mealId);
      } catch (error) {
        alert('Failed to delete meal: ' + error.message);
      }
    }
  };

  const handleRetry = () => {
    if (searchTerm.trim() || selectedCategory !== 'all') {
      searchMeals(searchTerm.trim(), selectedCategory);
    } else {
      fetchMeals();
    }
  };

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
        <button className="add-meal-btn">
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
                // Prevent infinite loop by only setting fallback once
                if (!e.target.dataset.fallback) {
                  e.target.dataset.fallback = 'true';
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjFmNWY5Ii8+CjxwYXRoIGQ9Ik0xMzAgMTAwTDE3MCA2MEwyMTAgMTAwTDE3MCAxNDBMMTMwIDEwMFoiIGZpbGw9IiM5NGEzYjgiLz4KPHN2ZyB4PSI1MCIgeT0iODAiIHdpZHRoPSIyMDAiIGhlaWdodD0iNDAiPgo8dGV4dCB4PSIxMDAiIHk9IjI1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NDc0OGIiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4KPC9zdmc+';
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
              
              <div className="meal-actions">
                <button className="btn-secondary">Edit</button>
                <button className="btn-primary">View Recipe</button>
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteMeal(meal.id, meal.name)}
                >
                  Delete
                </button>
              </div>
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
          <button className="add-meal-btn">
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
    </div>
  );
};

export default MealsPage;