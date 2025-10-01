// client/src/components/meals/MealDetailModal/MealDetailModal.jsx
import React from 'react';
import { X, Clock, Users, ChefHat, Edit } from 'lucide-react';
import './MealDetailModal.css';

const MealDetailModal = ({ meal, onClose, onEdit }) => {
  if (!meal) return null;

  const totalTime = (meal.prepTime || 0) + (meal.cookTime || 0);

  return (
    <div className="meal-detail-overlay" onClick={onClose}>
      <div className="meal-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-hero">
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
          <div className="hero-overlay">
            <div className="hero-content">
              <span className={`meal-badge ${meal.category}`}>
                {meal.category}
              </span>
              <h1>{meal.name}</h1>
              {meal.description && <p>{meal.description}</p>}
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="meal-stats">
            <div className="stat">
              <Clock size={20} />
              <div>
                <span className="stat-value">{totalTime} min</span>
                <span className="stat-label">Total Time</span>
              </div>
            </div>
            <div className="stat">
              <Users size={20} />
              <div>
                <span className="stat-value">{meal.servings}</span>
                <span className="stat-label">Servings</span>
              </div>
            </div>
            {meal.difficulty && (
              <div className="stat">
                <ChefHat size={20} />
                <div>
                  <span className="stat-value">{meal.difficulty}</span>
                  <span className="stat-label">Difficulty</span>
                </div>
              </div>
            )}
          </div>

          {meal.prepTime > 0 && meal.cookTime > 0 && (
            <div className="time-breakdown">
              <div className="time-item">
                <span>Prep Time:</span>
                <span>{meal.prepTime} minutes</span>
              </div>
              <div className="time-item">
                <span>Cook Time:</span>
                <span>{meal.cookTime} minutes</span>
              </div>
            </div>
          )}

          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="ingredients-section">
              <h2>Ingredients</h2>
              <ul className="ingredients-list">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index} className="ingredient-item">
                    <span className="ingredient-quantity">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                    <span className="ingredient-name">{ingredient.name}</span>
                    {ingredient.store && (
                      <span className="ingredient-store">{ingredient.store}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.instructions && (
            <div className="instructions-section">
              <h2>Instructions</h2>
              <div className="instructions-content">
                {meal.instructions.split('\n').map((line, index) => (
                  line.trim() && <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn-primary" onClick={() => onEdit(meal)}>
              <Edit size={16} />
              Edit Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealDetailModal;