// client/src/components/planning/PrepPlanDisplay/PrepPlanDisplay.jsx
import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  ShoppingCart,
  ChefHat,
  Flame,
  UtensilsCrossed,
  Timer,
  Printer,
  AlertTriangle,
  Check
} from 'lucide-react';
import './PrepPlanDisplay.css';

const TABS = [
  { id: 'ingredients', label: 'Ingredients', icon: ShoppingCart },
  { id: 'prep', label: 'Prep', icon: ChefHat },
  { id: 'cooking', label: 'Cooking', icon: Flame },
  { id: 'assembly', label: 'Assembly', icon: UtensilsCrossed }
];

const PrepPlanDisplay = ({ prepPlan, onBack }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  if (!prepPlan) return null;

  const {
    ingredients,
    ingredientsByCategory,
    prepPlan: steps,
    totalPrepTime,
    totalCookTime,
    totalTime,
    mealSummary,
    warnings
  } = prepPlan;

  const toggleIngredient = (name) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const toggleStep = (tabId, stepNumber) => {
    const key = `${tabId}-${stepNumber}`;
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const renderSteps = (stepList, tabId) => {
    if (!stepList || stepList.length === 0) {
      return (
        <div className="no-steps">
          <p>No {tabId} steps for these meals</p>
        </div>
      );
    }

    return (
      <div className="steps-list">
        {stepList.map((step, index) => {
          const stepKey = `${tabId}-${step.stepNumber}`;
          const isChecked = checkedSteps.has(stepKey);

          return (
            <div
              key={index}
              className={`step-item ${isChecked ? 'completed' : ''} ${step.isFreeform ? 'freeform' : ''}`}
              onClick={() => toggleStep(tabId, step.stepNumber)}
            >
              <span className="step-number-badge">{step.stepNumber}</span>
              <div className="step-content">
                <p className="step-action">{step.action}</p>
                <div className="step-meta">
                  {step.duration > 0 && (
                    <span className="step-duration">
                      <Timer size={12} />
                      {step.duration} min
                    </span>
                  )}
                  {step.isFreeform && (
                    <span className="step-freeform-badge">Freeform</span>
                  )}
                </div>
              </div>
              {isChecked && <Check size={18} className="step-check-icon" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="prep-plan-display">
      <div className="prep-plan-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={18} />
          Back
        </button>
        <h3>Prep Plan</h3>
        <button className="print-btn" onClick={handlePrint}>
          <Printer size={18} />
          Print
        </button>
      </div>

      {/* Time Summary */}
      <div className="time-summary">
        <div className="time-item">
          <ChefHat size={16} />
          <span>Prep: {formatTime(totalPrepTime)}</span>
        </div>
        <div className="time-item">
          <Flame size={16} />
          <span>Cook: {formatTime(totalCookTime)}</span>
        </div>
        <div className="time-item total">
          <Clock size={16} />
          <span>Total: {formatTime(totalTime)}</span>
        </div>
      </div>

      {/* Meal Summary */}
      <div className="meal-summary">
        <h4>Meals ({mealSummary.length})</h4>
        <div className="meal-tags">
          {mealSummary.map(meal => (
            <span key={meal.mealId} className="meal-tag">
              {meal.name}
              <span className="servings-badge">{meal.servings}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {warnings && (
        <div className="prep-warnings">
          <AlertTriangle size={16} />
          <span>{warnings.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="prep-tabs">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const stepCount = tab.id === 'ingredients'
            ? ingredients?.length || 0
            : steps?.[`${tab.id}Steps`]?.length || 0;

          return (
            <button
              key={tab.id}
              className={`prep-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {stepCount > 0 && <span className="tab-count">{stepCount}</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="prep-tab-content">
        {activeTab === 'ingredients' && (
          <div className="ingredients-section">
            {ingredientsByCategory && Object.keys(ingredientsByCategory).length > 0 ? (
              Object.entries(ingredientsByCategory).map(([category, items]) => (
                <div key={category} className="ingredient-category">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="ingredient-list">
                    {items.map((ingredient, index) => (
                      <div
                        key={index}
                        className={`ingredient-item ${checkedIngredients.has(ingredient.name) ? 'checked' : ''}`}
                        onClick={() => toggleIngredient(ingredient.name)}
                      >
                        <div className="ingredient-checkbox">
                          {checkedIngredients.has(ingredient.name) && <Check size={14} />}
                        </div>
                        <span className="ingredient-name">{ingredient.name}</span>
                        <span className="ingredient-quantity">
                          {ingredient.displayQuantity || `${ingredient.quantity} ${ingredient.unit || ''}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-ingredients">
                <p>No ingredients found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prep' && renderSteps(steps?.prepSteps, 'prep')}
        {activeTab === 'cooking' && renderSteps(steps?.cookingSteps, 'cooking')}
        {activeTab === 'assembly' && renderSteps(steps?.assemblySteps, 'assembly')}
      </div>
    </div>
  );
};

export default PrepPlanDisplay;
