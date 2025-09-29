import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import './PlanningCalendar.css';

const DroppableSlot = ({ date, mealType, meal, onSlotClick, isToday }) => {
  const dateStr = date.toISOString().split('T')[0];
  const { isOver, setNodeRef } = useDroppable({
    id: `${dateStr}-${mealType}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`meal-slot ${isToday ? 'today' : ''} ${isOver ? 'drag-over' : ''} ${meal ? 'occupied' : 'empty'}`}
      onClick={() => onSlotClick(date, mealType)}
    >
      {meal ? (
        <div className="planned-meal">
          <img src={meal.imageUrl} alt={meal.name} />
          <div className="meal-details">
            <span className="meal-name">{meal.name}</span>
            <span className="meal-time">{(meal.prepTime || 0) + (meal.cookTime || 0)} min</span>
          </div>
        </div>
      ) : (
        <div className="empty-slot">
          <Plus size={16} />
          <span>Add meal</span>
        </div>
      )}
    </div>
  );
};

const PlanningCalendar = ({ weekDays, mealPlans, onSlotClick, loading }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

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