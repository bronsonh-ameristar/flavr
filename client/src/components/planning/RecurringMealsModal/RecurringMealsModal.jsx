import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, RotateCcw, Play, ToggleLeft, ToggleRight } from 'lucide-react';
import { useRecurringMeals } from '../../../hooks/useRecurringMeals';
import MealSelector from '../MealSelector/MealSelector';
import './RecurringMealsModal.css';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

const RecurringMealsModal = ({ onClose, meals = [], weekStart, onApplied }) => {
  const {
    recurringMeals,
    groupedByDay,
    loading,
    error,
    fetchRecurringMeals,
    createRecurringMeal,
    deleteRecurringMeal,
    toggleActive,
    applyRecurringMeals
  } = useRecurringMeals();

  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMealType, setSelectedMealType] = useState('dinner');
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    fetchRecurringMeals();
  }, [fetchRecurringMeals]);

  const handleAddRecurringMeal = async () => {
    if (!selectedMeal) {
      alert('Please select a meal');
      return;
    }

    try {
      await createRecurringMeal({
        mealId: selectedMeal.id,
        dayOfWeek: selectedDay,
        mealType: selectedMealType
      });
      setShowAddForm(false);
      setSelectedMeal(null);
    } catch (err) {
      alert('Failed to add recurring meal: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring meal?')) {
      try {
        await deleteRecurringMeal(id);
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (rm) => {
    try {
      await toggleActive(rm.id, rm.isActive);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  const handleApplyToCurrentWeek = async () => {
    if (!weekStart) {
      alert('No week selected');
      return;
    }

    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      const result = await applyRecurringMeals(startDate, endDateStr);
      setApplyMessage(result.message);
      if (onApplied) {
        onApplied();
      }
      setTimeout(() => setApplyMessage(''), 3000);
    } catch (err) {
      alert('Failed to apply: ' + err.message);
    }
  };

  return (
    <div className="recurring-meals-overlay" onClick={onClose}>
      <div className="recurring-meals-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <RotateCcw size={20} />
            Recurring Meals
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">{error}</div>
          )}

          {applyMessage && (
            <div className="success-message">{applyMessage}</div>
          )}

          <div className="modal-actions-top">
            <button
              className="btn-primary"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus size={16} />
              Add Recurring Meal
            </button>
            <button
              className="btn-secondary"
              onClick={handleApplyToCurrentWeek}
              disabled={loading || recurringMeals.length === 0}
            >
              <Play size={16} />
              Apply to Current Week
            </button>
          </div>

          {showAddForm && (
            <div className="add-recurring-form">
              <h3>Add New Recurring Meal</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Day of Week</label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                  >
                    {DAYS_OF_WEEK.map((day, index) => (
                      <option key={day} value={index}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Meal Type</label>
                  <select
                    value={selectedMealType}
                    onChange={(e) => setSelectedMealType(e.target.value)}
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Select Meal {selectedMeal && `- ${selectedMeal.name}`}</label>
                <div className="meal-selector-container">
                  <MealSelector
                    meals={meals}
                    onMealSelect={setSelectedMeal}
                    selectedMealId={selectedMeal?.id}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn-cancel"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedMeal(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-add"
                  onClick={handleAddRecurringMeal}
                  disabled={!selectedMeal || loading}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="recurring-meals-list">
            {loading && <p className="loading-text">Loading...</p>}

            {!loading && recurringMeals.length === 0 && (
              <p className="empty-text">No recurring meals set up yet. Add some to automate your meal planning!</p>
            )}

            {DAYS_OF_WEEK.map((day, dayIndex) => {
              const mealsForDay = groupedByDay[day] || [];
              if (mealsForDay.length === 0) return null;

              return (
                <div key={day} className="day-group">
                  <h4 className="day-header">{day}</h4>
                  <div className="day-meals">
                    {mealsForDay.map(rm => (
                      <div key={rm.id} className={`recurring-meal-item ${!rm.isActive ? 'inactive' : ''}`}>
                        <div className="meal-info">
                          <span className={`meal-type-badge ${rm.mealType}`}>
                            {rm.mealType}
                          </span>
                          <span className="meal-name">{rm.meal?.name || 'Unknown meal'}</span>
                        </div>
                        <div className="meal-actions">
                          <button
                            className="toggle-btn"
                            onClick={() => handleToggleActive(rm)}
                            title={rm.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {rm.isActive ? <ToggleRight size={20} className="active" /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(rm.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringMealsModal;
