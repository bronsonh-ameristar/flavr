import React from 'react';
import { X, Clock, Users, ChefHat, Plus, Check, Globe } from 'lucide-react';
import './SearchMealDetailModal.css';

const SearchMealDetailModal = ({ meal, onClose, onAdd, isAdded }) => {
  if (!meal) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const totalTime = meal.totalTime || (meal.prepTime || 0) + (meal.cookTime || 0);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="search-meal-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-image">
          <img 
            src={meal.imageUrl || `https://via.placeholder.com/800x400/e2e8f0/64748b?text=${encodeURIComponent(meal.name)}`}
            alt={meal.name}
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.dataset.fallback = 'true';
                e.target.src = `https://via.placeholder.com/800x400/e2e8f0/64748b?text=${encodeURIComponent(meal.name)}`;
              }
            }}
          />
          <div className="image-overlay">
            <div className="meal-tags">
              <span className="tag category">{meal.category}</span>
              {meal.cuisineType && (
                <span className="tag cuisine">{meal.cuisineType}</span>
              )}
              <span className="tag source">
                <Globe size={14} />
                Global Recipe
              </span>
            </div>
          </div>
        </div>

        <div className="modal-content">
          <div className="modal-header">
            <h2>{meal.name}</h2>
            <button 
              className={`btn-add-modal ${isAdded ? 'added' : ''}`}
              onClick={() => onAdd(meal)}
              disabled={isAdded}
            >
              {isAdded ? (
                <>
                  <Check size={20} />
                  Added to Your Recipes
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add to My Recipes
                </>
              )}
            </button>
          </div>

          {meal.description && (
            <p className="meal-description">{meal.description}</p>
          )}

          <div className="meal-info-grid">
            {totalTime > 0 && (
              <div className="info-item">
                <Clock size={20} />
                <div>
                  <span className="info-label">Total Time</span>
                  <span className="info-value">{totalTime} minutes</span>
                </div>
              </div>
            )}

            {meal.prepTime > 0 && (
              <div className="info-item">
                <ChefHat size={20} />
                <div>
                  <span className="info-label">Prep Time</span>
                  <span className="info-value">{meal.prepTime} minutes</span>
                </div>
              </div>
            )}

            {meal.cookTime > 0 && (
              <div className="info-item">
                <Clock size={20} />
                <div>
                  <span className="info-label">Cook Time</span>
                  <span className="info-value">{meal.cookTime} minutes</span>
                </div>
              </div>
            )}

            <div className="info-item">
              <Users size={20} />
              <div>
                <span className="info-label">Servings</span>
                <span className="info-value">{meal.servings}</span>
              </div>
            </div>

            {meal.difficulty && (
              <div className="info-item">
                <ChefHat size={20} />
                <div>
                  <span className="info-label">Difficulty</span>
                  <span className={`info-value difficulty ${meal.difficulty}`}>
                    {meal.difficulty.charAt(0).toUpperCase() + meal.difficulty.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="modal-section">
              <h3>Ingredients</h3>
              <ul className="ingredients-list">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <span className="ingredient-name">
                      {ingredient.quantity && ingredient.unit 
                        ? `${ingredient.quantity} ${ingredient.unit} `
                        : ingredient.quantity 
                        ? `${ingredient.quantity} `
                        : ''}
                      {ingredient.name}
                    </span>
                    {ingredient.notes && (
                      <span className="ingredient-notes">({ingredient.notes})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.instructions && (
            <div className="modal-section">
              <h3>Instructions</h3>
              <div className="instructions">
                {meal.instructions.split('\n').map((step, index) => (
                  step.trim() && (
                    <div key={index} className="instruction-step">
                      <span className="step-number">{index + 1}</span>
                      <p>{step.trim()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchMealDetailModal;