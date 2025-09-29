import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, ShoppingCart, BarChart3 } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { useMeals } from '../../hooks/useMeals';
import MealSelector from '../../components/planning/MealSelector/MealSelector';
import PlanningCalendar from '../../components/planning/PlanningCalendar/PlanningCalendar';
import StatsPanel from '../../components/planning/StatsPanel/StatsPanel';
import './EnhancedPlanningPage.css';

const EnhancedPlanningPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [draggedMeal, setDraggedMeal] = useState(null);

  // Get the start of the current week (Sunday)
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const startDateStr = weekStart.toISOString().split('T')[0];
  const endDateStr = weekEnd.toISOString().split('T')[0];

  // Hooks
  const { meals } = useMeals();
  const {
    mealPlans,
    stats,
    loading,
    error,
    addMealToPlan,
    removeMealFromPlan,
    generateGroceryList
  } = useMealPlanning(startDateStr, endDateStr);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  }, [weekStart]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const handleSlotClick = (date, mealType) => {
  const dateStr = date.toISOString().split('T')[0];
  const key = `${dateStr}_${mealType}`; // Change to underscore
  
  if (mealPlans[key]) {
    // Remove meal if slot is occupied
    if (window.confirm('Remove this meal from your plan?')) {
      removeMealFromPlan(dateStr, mealType);
    }
  } else {
    // Open meal selector for empty slot
    setSelectedSlot({ date: dateStr, mealType });
    setShowMealSelector(true);
  }
};

  const handleMealSelect = async (mealId) => {
    if (selectedSlot) {
      try {
        await addMealToPlan(selectedSlot.date, selectedSlot.mealType, mealId);
        setShowMealSelector(false);
        setSelectedSlot(null);
      } catch (error) {
        alert('Failed to add meal: ' + error.message);
      }
    }
  };

  const handleDragStart = (event) => {
    const meal = meals.find(m => m.id === parseInt(event.active.id));
    setDraggedMeal(meal);
  };

  const handleDragEnd = async (event) => {
  const { active, over } = event;
  setDraggedMeal(null);

  if (!over) return;

  const mealId = parseInt(active.id);
  const [date, mealType] = over.id.split('_'); // Now it works correctly

  console.log('Dropping meal:', { mealId, date, mealType }); // Debug log

  try {
    await addMealToPlan(date, mealType, mealId);
  } catch (error) {
    alert('Failed to add meal: ' + error.message);
  }
};

  const handleGenerateGroceryList = async () => {
    try {
      const groceryData = await generateGroceryList();
      // Navigate to grocery page with the generated list
      // For now, we'll show an alert with the count
      alert(`Generated grocery list with ${groceryData.totalItems} items!`);
    } catch (error) {
      alert('Failed to generate grocery list: ' + error.message);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="enhanced-planning-page">
        <div className="planning-header">
          <div className="header-content">
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
            <button 
              className="btn-secondary"
              onClick={() => setShowMealSelector(true)}
            >
              <Plus size={16} />
              Quick Add Meal
            </button>
            <button 
              className="btn-primary"
              onClick={handleGenerateGroceryList}
              disabled={Object.keys(mealPlans).length === 0}
            >
              <ShoppingCart size={16} />
              Generate Grocery List
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>Error: {error}</span>
          </div>
        )}

        <div className="planning-content">
          <div className="planning-main">
            <PlanningCalendar
              weekDays={weekDays}
              mealPlans={mealPlans}
              onSlotClick={handleSlotClick}
              loading={loading}
            />
            
            <StatsPanel stats={stats} />
          </div>

          <div className="planning-sidebar">
            <MealSelector
              meals={meals}
              onMealSelect={draggedMeal ? null : handleMealSelect}
              isDragMode={true}
            />
          </div>
        </div>

        {showMealSelector && (
          <div className="meal-selector-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Select a Meal</h3>
                <button 
                  onClick={() => setShowMealSelector(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              <MealSelector
                meals={meals}
                onMealSelect={handleMealSelect}
                isDragMode={false}
              />
            </div>
          </div>
        )}

        <DragOverlay>
          {draggedMeal && (
            <div className="drag-preview">
              <img src={draggedMeal.imageUrl} alt={draggedMeal.name} />
              <span>{draggedMeal.name}</span>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default EnhancedPlanningPage;