// client/src/components/planning/PlanningCalendar/PlanningCalendar.jsx - COMPLETE REPLACEMENT
import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, RotateCcw, X } from 'lucide-react';
import './PlanningCalendar.css';

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DroppableSlot = ({ date, mealType, meal, onSlotClick, isToday, isRecurring }) => {
  const dateStr = formatLocalDate(date);

  // Use a clear prefix to identify droppable slots: "slot-YYYY-MM-DD-mealType"
  const dropId = `slot-${dateStr}-${mealType}`;

  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
  });

  return (
    <div
      ref={setNodeRef}
      className={`meal-slot ${isToday ? 'today' : ''} ${isOver ? 'drag-over' : ''} ${meal ? 'occupied' : 'empty'}`}
      onClick={() => onSlotClick(dateStr, mealType)}
    >
      {meal ? (
        <div className="planned-meal">
          {isRecurring && (
            <div className="recurring-indicator" title="Recurring meal">
              <RotateCcw size={12} />
            </div>
          )}
          <img
            src={meal.imageUrl || `https://via.placeholder.com/60x60/e2e8f0/64748b?text=${encodeURIComponent(meal.name)}`}
            alt={meal.name}
            onError={(e) => {
              if (!e.target.dataset.fallback) {
                e.target.dataset.fallback = 'true';
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjFmNWY5Ii8+CjxwYXRoIGQ9Ik0yNSAzMEwzNSAyMEw0NSAzMEwzNSA0MEwyNSAzMFoiIGZpbGw9IiM5NGEzYjgiLz4KPC9zdmc+';
              }
            }}
          />
          <div className="meal-details">
            <span className="meal-name">{meal.name}</span>
            <span className="meal-time">{((meal.prepTime || 0) + (meal.cookTime || 0))} min</span>
          </div>
        </div>
      ) : (
        <button className="empty-slot-btn" onClick={(e) => {
          e.stopPropagation();
          onSlotClick(dateStr, mealType);
        }}>
          <Plus size={16} />
          <span>Add meal</span>
        </button>
      )}
    </div>
  );
};

const DEFAULT_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const PlanningCalendar = ({
  weekDays,
  mealPlans,
  onSlotClick,
  loading,
  recurringMeals = [],
  allMealTypes = [],
  onAddMealType,
  onDeleteMealType
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [showAddMealType, setShowAddMealType] = useState(false);
  const [newMealTypeName, setNewMealTypeName] = useState('');

  // Use allMealTypes if provided, otherwise fall back to defaults
  const mealTypes = allMealTypes.length > 0
    ? allMealTypes.map(t => t.name)
    : DEFAULT_MEAL_TYPES;

  // Check if a meal type is deletable (not a default type)
  const isDeletable = (mealTypeName) => {
    return !DEFAULT_MEAL_TYPES.includes(mealTypeName.toLowerCase());
  };

  // Handle adding a new meal type
  const handleAddMealType = async () => {
    if (!newMealTypeName.trim()) return;

    try {
      if (onAddMealType) {
        await onAddMealType(newMealTypeName.trim());
      }
      setNewMealTypeName('');
      setShowAddMealType(false);
    } catch (err) {
      alert('Failed to add meal type: ' + err.message);
    }
  };

  // Handle deleting a custom meal type
  const handleDeleteMealType = async (mealType) => {
    const typeInfo = allMealTypes.find(t => t.name === mealType);
    if (!typeInfo || typeInfo.isDefault) return;

    if (window.confirm(`Are you sure you want to remove "${mealType}" from your meal types?`)) {
      try {
        if (onDeleteMealType) {
          await onDeleteMealType(typeInfo.id);
        }
      } catch (err) {
        alert('Failed to delete meal type: ' + err.message);
      }
    }
  };

  // Check if a meal slot is from a recurring meal
  const isRecurringSlot = (date, mealType, meal) => {
    if (!meal || recurringMeals.length === 0) return false;
    const dayOfWeek = date.getDay();
    return recurringMeals.some(rm =>
      rm.dayOfWeek === dayOfWeek &&
      rm.mealType === mealType &&
      rm.mealId === meal.id
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (loading) {
    return (
      <div className="planning-calendar loading">
        <div className="loading-spinner"></div>
        <p>Loading meal plans...</p>
      </div>
    );
  }

  return (
    <div className="planning-calendar">
      <div className="calendar-header">
        <div className="time-column-header">Meal</div>
        {weekDays.map((date, index) => (
          <div key={index} className={`day-header ${isToday(date) ? 'today' : ''}`}>
            <div className="day-name">{dayNames[index]}</div>
            <div className="day-number">{date.getDate()}</div>
          </div>
        ))}
      </div>

      <div className="calendar-body">
        {mealTypes.map(mealType => (
          <div key={mealType} className="meal-row">
            <div className="meal-type-header">
              <span className="meal-type-name">
                {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
              </span>
              {isDeletable(mealType) && onDeleteMealType && (
                <button
                  className="delete-meal-type-btn"
                  onClick={() => handleDeleteMealType(mealType)}
                  title={`Remove ${mealType}`}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {weekDays.map((date, dayIndex) => {
              const dateStr = formatLocalDate(date);
              const planKey = `${dateStr}-${mealType}`;
              const meal = mealPlans[planKey]?.meal;

              return (
                <DroppableSlot
                  key={`${mealType}-${dayIndex}`}
                  date={date}
                  mealType={mealType}
                  meal={meal}
                  onSlotClick={onSlotClick}
                  isToday={isToday(date)}
                  isRecurring={isRecurringSlot(date, mealType, meal)}
                />
              );
            })}
          </div>
        ))}

        {/* Add meal type row */}
        {onAddMealType && (
          <div className="add-meal-type-row">
            {showAddMealType ? (
              <div className="add-meal-type-form">
                <input
                  type="text"
                  value={newMealTypeName}
                  onChange={(e) => setNewMealTypeName(e.target.value)}
                  placeholder="e.g., Snack, Brunch..."
                  className="meal-type-input"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddMealType();
                    if (e.key === 'Escape') {
                      setShowAddMealType(false);
                      setNewMealTypeName('');
                    }
                  }}
                />
                <button
                  className="btn-confirm-add"
                  onClick={handleAddMealType}
                  disabled={!newMealTypeName.trim()}
                >
                  Add
                </button>
                <button
                  className="btn-cancel-add"
                  onClick={() => {
                    setShowAddMealType(false);
                    setNewMealTypeName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="add-meal-type-btn"
                onClick={() => setShowAddMealType(true)}
              >
                <Plus size={16} />
                <span>Add Meal Type</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningCalendar;