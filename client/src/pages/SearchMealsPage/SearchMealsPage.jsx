// client/src/pages/SearchMealsPage/SearchMealsPage.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users, Eye, Plus, Check, AlertCircle } from 'lucide-react';
import { useSearchMeals } from '../../hooks/useSearchMeals';
import SearchMealDetailModal from '../../components/meals/SearchMealDetailModal/SearchMealDetailModal';
import './SearchMealsPage.css';

const SearchMealsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [addedMeals, setAddedMeals] = useState(new Set());
  
  const { 
    searchMeals, 
    loading, 
    error, 
    totalCount,
    fetchTopMeals,
    searchGlobalMeals,
    addMealToPersonal,
    checkMealInPersonal
  } = useSearchMeals();

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const cuisines = ['all', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'American', 'Thai', 'French', 'Mediterranean'];

  // Load initial top 10 meals
  useEffect(() => {
    fetchTopMeals(10);
  }, []);

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim() || selectedCategory !== 'all' || selectedCuisine !== 'all') {
        searchGlobalMeals({
          search: searchTerm.trim(),
          category: selectedCategory,
          cuisineType: selectedCuisine,
          limit: 10
        });
      } else {
        fetchTopMeals(10);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, selectedCuisine]);

  const handleViewMeal = (meal) => {
    setViewingMeal(meal);
    setShowMealDetail(true);
  };

  const handleAddMealToPersonal = async (meal) => {
    try {
      await addMealToPersonal(meal.id);
      setAddedMeals(prev => new Set([...prev, meal.id]));
      
      // Show success message
      const message = document.createElement('div');
      message.className = 'success-toast';
      message.textContent = `"${meal.name}" added to your recipes!`;
      document.body.appendChild(message);
      
      setTimeout(() => {
        message.remove();
      }, 3000);
    } catch (error) {
      alert('Failed to add meal: ' + error.message);
    }
  };

  const handleRetry = () => {
    if (searchTerm.trim() || selectedCategory !== 'all' || selectedCuisine !== 'all') {
      searchGlobalMeals({
        search: searchTerm.trim(),
        category: selectedCategory,
        cuisineType: selectedCuisine,
        limit: 10
      });
    } else {
      fetchTopMeals(10);
    }
  };

  const isMealAdded = (mealId) => {
    return addedMeals.has(mealId);
  };

  if (loading && searchMeals.length === 0) {
    return (
      <div className="search-meals-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-meals-page">
      <div className="search-meals-header">
        <div>
          <h1>Discover Recipes</h1>
          <p className="subtitle">Browse our collection of {totalCount} global recipes</p>
        </div>
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

      <div className="search-meals-controls">
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search recipes by name..."
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

      <div className="search-meals-grid">
        {searchMeals.map(meal => (
          <div key={meal.id} className="search-meal-card">
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
                <span>View</span>
              </button>
              <button 
                className={`btn-add ${isMealAdded(meal.id) ? 'added' : ''}`}
                onClick={() => handleAddMealToPersonal(meal)}
                disabled={isMealAdded(meal.id)}
                title={isMealAdded(meal.id) ? "Already added" : "Add to my recipes"}
              >
                {isMealAdded(meal.id) ? (
                  <>
                    <Check size={18} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {searchMeals.length === 0 && !loading && !error && (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>
            {searchTerm || selectedCategory !== 'all' || selectedCuisine !== 'all'
              ? 'Try adjusting your search or filters' 
              : 'No recipes available at the moment'
            }
          </p>
        </div>
      )}

      {loading && searchMeals.length > 0 && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {showMealDetail && viewingMeal && (
        <SearchMealDetailModal
          meal={viewingMeal}
          onClose={() => {
            setShowMealDetail(false);
            setViewingMeal(null);
          }}
          onAdd={(meal) => {
            handleAddMealToPersonal(meal);
          }}
          isAdded={isMealAdded(viewingMeal.id)}
        />
      )}
    </div>
  );
};

export default SearchMealsPage;