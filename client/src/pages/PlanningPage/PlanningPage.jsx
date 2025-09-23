// client/src/pages/PlanningPage/PlanningPage.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';
import './PlanningPage.css';

const PlanningPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get the start of the current week (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return date;
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  // Mock planned meals data
  const plannedMeals = {
    '2024-01-15-breakfast': { id: 1, name: 'Overnight Oats', prepTime: 5 },
    '2024-01-15-lunch': { id: 2, name: 'Mediterranean Salad', prepTime: 15 },
    '2024-01-15-dinner': { id: 3, name: 'Chicken Stir Fry', prepTime: 20 },
    '2024-01-16-breakfast': { id: 1, name: 'Overnight Oats', prepTime: 5 },
    '2024-01-17-dinner': { id: 3, name: 'Chicken Stir Fry', prepTime: 20 },
  };

  const formatDateKey = (date, mealType) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}-${mealType}`;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="planning-page">
      <div className="planning-header">
        <h1>Meal Planning</h1>
        <div className="week-navigation">
          <button onClick={() => navigateWeek(-1)} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <span className="week-display">
            Week of {weekStart.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
          <button onClick={() => navigateWeek(1)} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="planning-actions">
        <button className="btn-primary">
          <Plus size={16} />
          Quick Add Meal
        </button>
        <button className="btn-secondary">
          <Calendar size={16} />
          Generate Grocery List
        </button>
      </div>

      <div className="weekly-calendar">
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
                const dateKey = formatDateKey(date, mealType);
                const plannedMeal = plannedMeals[dateKey];
                
                return (
                  <div 
                    key={`${mealType}-${dayIndex}`} 
                    className={`meal-slot ${isToday(date) ? 'today' : ''}`}
                  >
                    {plannedMeal ? (
                      <div className="planned-meal">
                        <div className="meal-name">{plannedMeal.name}</div>
                        <div className="meal-time">{plannedMeal.prepTime} min</div>
                      </div>
                    ) : (
                      <div className="empty-slot">
                        <Plus size={16} className="add-icon" />
                        <span>Add meal</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="planning-summary">
        <div className="summary-card">
          <h3>This Week's Summary</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-number">12</span>
              <span className="stat-label">Meals Planned</span>
            </div>
            <div className="stat">
              <span className="stat-number">3.5</span>
              <span className="stat-label">Avg Cook Time (hrs)</span>
            </div>
            <div className="stat">
              <span className="stat-number">5</span>
              <span className="stat-label">Unique Recipes</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <h3>Shopping Needed</h3>
          <div className="shopping-preview">
            <p>Generate your grocery list to see what ingredients you need for this week's meals.</p>
            <button className="btn-primary">
              <Calendar size={16} />
              Generate List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPage;