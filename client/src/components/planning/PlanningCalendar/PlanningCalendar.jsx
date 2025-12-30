// client/src/components/planning/PlanningCalendar/PlanningCalendar.jsx - COMPLETE REPLACEMENT
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import './PlanningCalendar.css';

const DroppableSlot = ({ date, mealType, meal, onSlotClick, isToday }) => {
  const dateStr = date.toISOString().split('T')[0];

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

const PlanningCalendar = ({ weekDays, mealPlans, onSlotClick, loading }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'other'];

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
            </div>
            
            {weekDays.map((date, dayIndex) => {
              const dateStr = date.toISOString().split('T')[0];
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
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanningCalendar;