// client/src/pages/PlanningPage/EnhancedPlanningPage.jsx
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { useMeals } from '../../hooks/useMeals';
import { useViewMeals } from '../../hooks/useViewMeals';
import PlanningCalendar from '../../components/planning/PlanningCalendar/PlanningCalendar';
import StatsPanel from '../../components/planning/StatsPanel/StatsPanel';
import AddMealModal from '../../components/planning/AddMealModal/AddMealModal';
import OccupiedSlotModal from '../../components/planning/OccupiedSlotModal/OccupiedSlotModal';
import MealDetailModal from '../../components/meals/MealDetailModal/MealDetailModal';
import MealForm from '../../components/meals/MealForm/MealForm';
import './EnhancedPlanningPage.css';

const EnhancedPlanningPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [draggedMeal, setDraggedMeal] = useState(null);
  // variables for the add meal modal
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  // variables for the occupied slot modal
  const [showOccupiedSlotModal, setShowOccupiedSlotModal] = useState(false);
  const [occupiedMealType, setOccupiedMealType] = useState(null);
  const [occupiedDate, setOccupiedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMealForm, setShowMealForm] = useState(false);
  const [showMealDetail, setShowMealDetail] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [viewingMeal, setViewingMeal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const { 
      meals, 
      totalCount, 
      fetchMeals,
      searchMeals, 
      createMeal,
      updateMeal,
      deleteMeal 
    } = useMeals();

  const {
    mealPlans,
    stats,
    loading,
    error,
    addMealToPlan,
    removeMealFromPlan,
    generateGroceryList
  } = useMealPlanning(startDateStr, endDateStr);

  // Use the new hook for meal viewing/editing
  const {
    showMealDetailModal,
    handleViewMeal,
    handleEditMeal,
    handleSaveMeal,
    handleCancelForm,
    handleCloseMealDetail
  } = useViewMeals({
    deleteMeal,
    updateMeal,
    createMeal,
    searchMeals,
    fetchMeals,
    setEditingMeal,
    setShowMealForm,
    setViewingMeal,
    setShowMealDetail,
    setIsSubmitting,
    editingMeal,
    searchTerm,
    selectedCategory });

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
    const plannedMeal = mealPlans[key]?.meal;
    
    if (mealPlans[key]) {
      const fullMeal = meals.find(m => m.id === plannedMeal.id);
      setShowOccupiedSlotModal(true);
      setOccupiedDate(dateStr);
      setOccupiedMealType(mealType);
      // setViewingMeal(meal);
      setViewingMeal(fullMeal || plannedMeal); // determine if we can use full array or just planned
    } else {
      setSelectedSlot({ date: dateStr, mealType });
      setShowAddMealModal(true);
      setSelectedDays([])
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
    setShowAddMealModal(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setDraggedMeal(null);

    if (!over) return;

    const mealId = parseInt(active.id);
    
    const dropId = over.id;
    if (!dropId.startsWith('slot-')) {
      console.error('Invalid drop target:', dropId);
      return;
    }
    
    const withoutPrefix = dropId.substring(5);
    const lastDashIndex = withoutPrefix.lastIndexOf('-');
    
    if (lastDashIndex === -1) {
      console.error('Invalid drop ID format:', dropId);
      return;
    }
    
    const date = withoutPrefix.substring(0, lastDashIndex);
    const mealType = withoutPrefix.substring(lastDashIndex + 1);

    console.log('Drop details:', { dropId, date, mealType, mealId });

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
    setShowAddMealModal(true);
  };

  const handleGenerateGroceryList = async () => {
    try {
      const groceryData = await generateGroceryList();
      if (groceryData && groceryData.totalItems > 0) {
        alert(`Generated grocery list with ${groceryData.totalItems} items! (Navigate to Grocery page to view)`);
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
                setShowAddMealModal(true);
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

          {showAddMealModal && (
            <AddMealModal
              onClose={() => setShowAddMealModal(false)}
              selected={selectedDays}
            />
          )}

          {showOccupiedSlotModal && (
            <OccupiedSlotModal
              onClose={() => setShowOccupiedSlotModal(false)}
              deleteItem={() => {
                removeMealFromPlan(occupiedDate, occupiedMealType);
                setShowOccupiedSlotModal(false);
              }}
              openAddModal={() => {
                setShowOccupiedSlotModal(false);
                setShowAddMealModal(true);
              }}
              openViewModal={() => {
                setShowOccupiedSlotModal(false);
                handleViewMeal(viewingMeal);
              }}
            />
          )}

        {showMealForm && (
          <MealForm
            meal={editingMeal}
            onSave={handleSaveMeal}
            onCancel={handleCancelForm}
            isLoading={isSubmitting}
          />
        )}

        {showMealDetail && viewingMeal && (
          <MealDetailModal
            meal={viewingMeal}
            onClose={() => {
              setShowMealDetail(false);
              setViewingMeal(null);
            }}
            onEdit={(meal) => {
              setShowMealDetail(false);
              setViewingMeal(null);
              handleEditMeal(meal);
            }}
          />
        )}
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
        </div>

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