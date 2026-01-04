// client/src/components/planning/MealPrepPanel/MealPrepPanel.jsx
import React, { useState } from 'react';
import { ChefHat, ChevronDown, ChevronUp, Plus, Minus, X, Clock, AlertTriangle } from 'lucide-react';
import { usePrepPlan } from '../../../hooks/usePrepPlan';
import PrepPlanDisplay from '../PrepPlanDisplay/PrepPlanDisplay';
import './MealPrepPanel.css';

const MealPrepPanel = ({ meals = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { prepPlan, isLoading, error, generatePlan, clearPlan } = usePrepPlan();

  // Filter meals based on search
  const filteredMeals = meals.filter(meal =>
    meal.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add meal to selection
  const addMeal = (meal) => {
    if (!selectedMeals.find(m => m.mealId === meal.id)) {
      setSelectedMeals(prev => [
        ...prev,
        { mealId: meal.id, name: meal.name, servings: meal.servings || 4 }
      ]);
      setSearchTerm('');
    }
  };

  // Remove meal from selection
  const removeMeal = (mealId) => {
    setSelectedMeals(prev => prev.filter(m => m.mealId !== mealId));
  };

  // Update servings for a meal
  const updateServings = (mealId, newServings) => {
    if (newServings < 1) return;
    setSelectedMeals(prev =>
      prev.map(m => m.mealId === mealId ? { ...m, servings: newServings } : m)
    );
  };

  // Generate the prep plan
  const handleGeneratePlan = async () => {
    if (selectedMeals.length === 0) return;
    await generatePlan(selectedMeals);
  };

  // Clear everything
  const handleClear = () => {
    setSelectedMeals([]);
    clearPlan();
  };

  return (
    <div className={`meal-prep-panel ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="prep-panel-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="toggle-content">
          <ChefHat size={20} />
          <span>Meal Prep Planner</span>
          {selectedMeals.length > 0 && (
            <span className="meal-count">{selectedMeals.length} meals</span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isExpanded && (
        <div className="prep-panel-content">
          {!prepPlan ? (
            <div className="prep-selector">
              <div className="selector-header">
                <h3>Select Meals to Prep</h3>
                {selectedMeals.length > 0 && (
                  <button className="clear-all-btn" onClick={handleClear}>
                    Clear All
                  </button>
                )}
              </div>

              <div className="meal-search">
                <input
                  type="text"
                  placeholder="Search meals to add..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && filteredMeals.length > 0 && (
                  <div className="meal-search-results">
                    {filteredMeals.slice(0, 5).map(meal => (
                      <button
                        key={meal.id}
                        className="meal-search-item"
                        onClick={() => addMeal(meal)}
                      >
                        <span className="meal-name">{meal.name}</span>
                        <span className="meal-time">
                          <Clock size={12} />
                          {(meal.prepTime || 0) + (meal.cookTime || 0)} min
                        </span>
                        <Plus size={16} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedMeals.length > 0 && (
                <div className="selected-meals">
                  <h4>Selected Meals</h4>
                  <div className="selected-meals-list">
                    {selectedMeals.map(meal => (
                      <div key={meal.mealId} className="selected-meal-item">
                        <span className="meal-name">{meal.name}</span>
                        <div className="servings-control">
                          <button
                            onClick={() => updateServings(meal.mealId, meal.servings - 1)}
                            disabled={meal.servings <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="servings-value">{meal.servings}</span>
                          <button onClick={() => updateServings(meal.mealId, meal.servings + 1)}>
                            <Plus size={14} />
                          </button>
                          <span className="servings-label">servings</span>
                        </div>
                        <button
                          className="remove-meal-btn"
                          onClick={() => removeMeal(meal.mealId)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    className="generate-btn"
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Generating...' : 'Generate Prep Plan'}
                  </button>
                </div>
              )}

              {error && (
                <div className="prep-error">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              {selectedMeals.length === 0 && !searchTerm && (
                <div className="prep-empty-state">
                  <ChefHat size={32} />
                  <p>Search and add meals to create a consolidated prep plan</p>
                  <p className="hint">
                    The prep plan will combine ingredients and organize cooking steps
                  </p>
                </div>
              )}
            </div>
          ) : (
            <PrepPlanDisplay
              prepPlan={prepPlan}
              onBack={() => clearPlan()}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MealPrepPanel;
