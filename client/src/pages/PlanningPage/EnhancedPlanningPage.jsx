// client/src/pages/PlanningPage/EnhancedPlanningPage.jsx - COMPLETE REPLACEMENT
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react';
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
    const key = `${dateStr}-${mealType}`;
    
    if (mealPlans[key]) {
      if (window.confirm('Remove this meal from your plan?')) {
        removeMealFromPlan(dateStr, mealType);
      }
    } else {
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
    
    // Parse the droppable ID: format is "slot-YYYY-MM-DD-mealType"
    const dropId = over.id;
    if (!dropId.startsWith('slot-')) {
      console.error('Invalid drop target:', dropId);
      return;
    }
    
    // Remove "slot-" prefix and split
    const withoutPrefix = dropId.substring(5); // Remove "slot-"
    const lastDashIndex = withoutPrefix.lastIndexOf('-');
    
    if (lastDashIndex === -1) {
      console.error('Invalid drop ID format:', dropId);
      return;
    }
    
    const date = withoutPrefix.substring(0, lastDashIndex);
    const mealType = withoutPrefix.substring(lastDashIndex + 1);

    console.log('Drop details:', { dropId, date, mealType, mealId });

    // Validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      alert('Invalid date format');
      return;
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner'];
    if (!validMealTypes.includes(mealType)) {
      alert('Invalid meal type: ' + mealType);
      return;
    }

    if (isNaN(mealId) || mealId <= 0) {
      alert('Invalid meal ID');
      return;
    }

    try {
      await addMealToPlan(date, mealType, mealId);
    } catch (error) {
      console.error('Failed to add meal:', error);
      alert('Failed to add meal: ' + error.message);
    }
  };

  const handleGenerateGroceryList = async () => {
    try {
      const groceryData = await generateGroceryList();
      if (groceryData && groceryData.totalItems > 0) {
        alert(`Generated grocery list with ${groceryData.totalItems} items! (Navigate to Grocery page to view)`);
        // TODO: Store in state or navigate to grocery page
      } else {
        alert('No items to add to grocery list. Plan some meals first!');
      }
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
              onClick={() => {
                setSelectedSlot(null);
                setShowMealSelector(true);
              }}
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
              onMealSelect={null}
              isDragMode={true}
            />
          </div>
        </div>

        {showMealSelector && (
          <div className="meal-selector-modal" onClick={() => setShowMealSelector(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Select a Meal</h3>
                <button 
                  onClick={() => setShowMealSelector(false)}
                  className="close-btn"
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <MealSelector
                  meals={meals}
                  onMealSelect={handleMealSelect}
                  isDragMode={false}
                />
              </div>
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