// client/src/pages/PlanningPage/EnhancedPlanningPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, ShoppingCart, RotateCcw, FileText, Copy, Save } from 'lucide-react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import { useMeals } from '../../hooks/useMeals';
import { useViewMeals } from '../../hooks/useViewMeals';
import { useMealPlanTemplates } from '../../hooks/useMealPlanTemplates';
import { useRecurringMeals } from '../../hooks/useRecurringMeals';
import { useCustomMealTypes } from '../../hooks/useCustomMealTypes';
import PlanningCalendar from '../../components/planning/PlanningCalendar/PlanningCalendar';
import StatsPanel from '../../components/planning/StatsPanel/StatsPanel';
import AddMealModal from '../../components/planning/AddMealModal/AddMealModal';
import OccupiedSlotModal from '../../components/planning/OccupiedSlotModal/OccupiedSlotModal';
import MealDetailModal from '../../components/meals/MealDetailModal/MealDetailModal';
import MealForm from '../../components/meals/MealForm/MealForm';
import RecurringMealsModal from '../../components/planning/RecurringMealsModal/RecurringMealsModal';
import TemplatesModal from '../../components/planning/TemplatesModal/TemplatesModal';
import SaveTemplateModal from '../../components/planning/SaveTemplateModal/SaveTemplateModal';
import RecurringDeleteModal from '../../components/planning/RecurringDeleteModal/RecurringDeleteModal';
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
  // New modal states for recurring meals and templates
  const [showRecurringMealsModal, setShowRecurringMealsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showRecurringDeleteModal, setShowRecurringDeleteModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  // Generate week days for calendar
  const weekDays = [];
  let current = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    weekDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

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
    generateGroceryList,
    fetchMealPlans,
    fetchStats
  } = useMealPlanning(startDateStr, endDateStr);

  const { copyWeek } = useMealPlanTemplates();

  const { applyRecurringMeals, createRecurringMeal, deleteRecurringMeal, recurringMeals, fetchRecurringMeals } = useRecurringMeals();

  const {
    allMealTypes,
    mealTypeNames,
    fetchCustomMealTypes,
    createCustomMealType,
    deleteCustomMealType
  } = useCustomMealTypes();

  // Use the new hook for meal viewing/editing
  const {
    handleViewMeal: handleViewClick,
    handleEditMeal: handleEditClick,
    handleDeleteMeal: handleDeleteClick,
    handleSaveMeal: handleMealSubmit
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
    selectedCategory
  });

  useEffect(() => {
    fetchMeals();
    fetchRecurringMeals();
    fetchCustomMealTypes();
  }, [fetchMeals, fetchRecurringMeals, fetchCustomMealTypes]);

  // Fetch meal plans and apply recurring meals when week changes
  useEffect(() => {
    const loadWeekData = async () => {
      // First apply recurring meals to fill in any gaps
      try {
        await applyRecurringMeals(startDateStr, endDateStr);
      } catch (err) {
        // Silently ignore errors - recurring meals might not exist or user might not have any
        console.log('Auto-apply recurring meals:', err.message);
      }
      // Then fetch the meal plans (which now include any applied recurring meals)
      fetchMealPlans();
      fetchStats();
    };
    loadWeekData();
  }, [startDateStr, endDateStr, applyRecurringMeals, fetchMealPlans, fetchStats]);

  const handleSlotClick = (dateStr, mealType) => {
    console.log('Slot clicked:', { dateStr, mealType });
    const key = `${dateStr}-${mealType}`;
    const plannedMeal = mealPlans[key]?.meal;
    console.log('Planned meal for slot:', plannedMeal);

    if (mealPlans[key]) {
      const fullMeal = meals.find(m => m.id === plannedMeal.id);
      console.log('Opening OccupiedSlotModal for meal:', fullMeal || plannedMeal);
      setShowOccupiedSlotModal(true);
      setOccupiedDate(dateStr);
      setOccupiedMealType(mealType);
      setViewingMeal(fullMeal || plannedMeal);
    } else {
      console.log('Opening AddMealModal for empty slot');
      setSelectedSlot({ date: dateStr, mealType });
      setShowAddMealModal(true);
      setSelectedDays([]);
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

    // Validate meal type against available types (including custom ones)
    if (!mealTypeNames.includes(mealType)) {
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

  // Handlers for modals
  const handleSaveMeal = async (formData) => {
    await handleMealSubmit(formData);
  };

  const handleCancelForm = () => {
    setShowMealForm(false);
    setEditingMeal(null);
  };

  const handleViewMeal = (meal) => {
    setViewingMeal(meal);
    setShowMealDetail(true);
  };

  const handleEditMeal = (meal) => {
    handleEditClick(meal);
  };

  // Copy previous week's meal plan to current week
  const handleCopyPreviousWeek = async () => {
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    const sourceStartDate = previousWeekStart.toISOString().split('T')[0];
    const targetStartDate = weekStart.toISOString().split('T')[0];

    if (window.confirm('Copy meals from the previous week to this week? Existing meals will not be overwritten.')) {
      try {
        const result = await copyWeek(sourceStartDate, targetStartDate, false);
        alert(result.message);
        fetchMealPlans();
      } catch (err) {
        alert('Failed to copy week: ' + err.message);
      }
    }
  };

  // Callback when recurring meals or templates are applied
  const handlePlanningApplied = () => {
    fetchMealPlans();
    fetchStats();
    fetchRecurringMeals();
  };

  // Helper to check if current occupied slot is from a recurring meal
  const getRecurringMealForSlot = (dateStr, mealType, meal) => {
    if (!meal || recurringMeals.length === 0) return null;
    const date = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = date.getDay();
    return recurringMeals.find(rm =>
      rm.dayOfWeek === dayOfWeek &&
      rm.mealType === mealType &&
      rm.mealId === meal.id
    );
  };

  const isCurrentSlotRecurring = occupiedDate && occupiedMealType && viewingMeal
    ? !!getRecurringMealForSlot(occupiedDate, occupiedMealType, viewingMeal)
    : false;

  // Handlers for recurring meal deletion
  const handleDeleteThisOnly = async () => {
    // Just remove from the current day's meal plan
    await removeMealFromPlan(occupiedDate, occupiedMealType);
    setShowRecurringDeleteModal(false);
    setShowOccupiedSlotModal(false);
  };

  const handleDeleteThisAndFuture = async () => {
    // Remove from current plan and delete the recurring rule
    const recurringMeal = getRecurringMealForSlot(occupiedDate, occupiedMealType, viewingMeal);
    await removeMealFromPlan(occupiedDate, occupiedMealType);
    if (recurringMeal) {
      await deleteRecurringMeal(recurringMeal.id);
    }
    setShowRecurringDeleteModal(false);
    setShowOccupiedSlotModal(false);
  };

  const handleDeleteRecurringRule = async () => {
    // Just delete the recurring rule, leave the current meal plan entry
    const recurringMeal = getRecurringMealForSlot(occupiedDate, occupiedMealType, viewingMeal);
    if (recurringMeal) {
      await deleteRecurringMeal(recurringMeal.id);
    }
    setShowRecurringDeleteModal(false);
    setShowOccupiedSlotModal(false);
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
              Quick Add
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowRecurringMealsModal(true)}
              title="Recurring Meals"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowTemplatesModal(true)}
              title="Templates"
            >
              <FileText size={18} />
            </button>
            <button
              className="btn-icon"
              onClick={handleCopyPreviousWeek}
              title="Copy Previous Week"
            >
              <Copy size={18} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowSaveTemplateModal(true)}
              title="Save as Template"
              disabled={Object.keys(mealPlans).length === 0}
            >
              <Save size={18} />
            </button>
            <button
              className="btn-primary"
              onClick={handleGenerateGroceryList}
              disabled={Object.keys(mealPlans).length === 0}
            >
              <ShoppingCart size={16} />
              Grocery List
            </button>
          </div>

          {showAddMealModal && (
            <AddMealModal
              onClose={() => {
                setShowAddMealModal(false);
                setSelectedSlot(null);
              }}
              selected={selectedDays}
              meals={meals}
              selectedSlot={selectedSlot}
              mealTypes={allMealTypes}
              onSave={async (scheduleData) => {
                console.log('onSave called with:', scheduleData);
                console.log('selectedSlot:', selectedSlot);
                try {
                  // If a specific slot was clicked, use that slot directly
                  if (selectedSlot) {
                    console.log(`Adding meal ${scheduleData.mealId} to slot:`, selectedSlot);
                    await addMealToPlan(selectedSlot.date, selectedSlot.mealType, scheduleData.mealId);

                    // If makeRecurring is checked, also create a recurring meal
                    if (scheduleData.makeRecurring && scheduleData.dayOfWeek !== null) {
                      console.log('Creating recurring meal:', {
                        mealId: scheduleData.mealId,
                        dayOfWeek: scheduleData.dayOfWeek,
                        mealType: scheduleData.mealType
                      });
                      try {
                        await createRecurringMeal({
                          mealId: scheduleData.mealId,
                          dayOfWeek: scheduleData.dayOfWeek,
                          mealType: scheduleData.mealType
                        });
                        console.log('Recurring meal created successfully');
                      } catch (recurringError) {
                        console.error('Failed to create recurring meal:', recurringError);
                        // Don't fail the whole operation, just warn
                        alert('Meal added to plan, but failed to create recurring schedule: ' + recurringError.message);
                      }
                    }
                  } else {
                    // Otherwise, add meal to each selected day
                    console.log('Adding meal to multiple days:', scheduleData.days);
                    const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

                    for (const day of scheduleData.days) {
                      // Convert day name to actual date
                      const dayIndex = DAYS_OF_WEEK.indexOf(day);
                      const targetDate = new Date(weekStart);
                      targetDate.setDate(weekStart.getDate() + dayIndex);
                      const dateStr = targetDate.toISOString().split('T')[0];
                      console.log(`Adding meal to ${day} (${dateStr})`);

                      await addMealToPlan(dateStr, scheduleData.mealType, scheduleData.mealId);

                      // If recurring (weekly or custom), also create recurring meals
                      if (scheduleData.makeRecurring) {
                        try {
                          await createRecurringMeal({
                            mealId: scheduleData.mealId,
                            dayOfWeek: dayIndex,
                            mealType: scheduleData.mealType
                          });
                        } catch (recurringError) {
                          console.error(`Failed to create recurring meal for ${day}:`, recurringError);
                        }
                      }
                    }
                  }
                  console.log('Meal(s) added successfully');
                  setShowAddMealModal(false);
                  setSelectedSlot(null);
                } catch (error) {
                  console.error('Failed to add meal to plan:', error);
                  alert('Failed to add meal: ' + error.message);
                }
              }}
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
                setSelectedSlot({ date: occupiedDate, mealType: occupiedMealType });
                setShowAddMealModal(true);
              }}
              openViewModal={() => {
                setShowOccupiedSlotModal(false);
                handleViewMeal(viewingMeal);
              }}
              isRecurring={isCurrentSlotRecurring}
              onOpenRecurringDelete={() => {
                setShowOccupiedSlotModal(false);
                setShowRecurringDeleteModal(true);
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

          {showRecurringMealsModal && (
            <RecurringMealsModal
              onClose={() => setShowRecurringMealsModal(false)}
              meals={meals}
              weekStart={weekStart}
              onApplied={handlePlanningApplied}
            />
          )}

          {showTemplatesModal && (
            <TemplatesModal
              onClose={() => setShowTemplatesModal(false)}
              weekStart={weekStart}
              onApplied={handlePlanningApplied}
            />
          )}

          {showSaveTemplateModal && (
            <SaveTemplateModal
              onClose={() => setShowSaveTemplateModal(false)}
              weekStart={weekStart}
              mealPlans={mealPlans}
              onSaved={handlePlanningApplied}
            />
          )}

          {showRecurringDeleteModal && viewingMeal && (
            <RecurringDeleteModal
              onClose={() => setShowRecurringDeleteModal(false)}
              mealName={viewingMeal.name}
              onDeleteThisOnly={handleDeleteThisOnly}
              onDeleteThisAndFuture={handleDeleteThisAndFuture}
              onDeleteRecurringRule={handleDeleteRecurringRule}
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
              recurringMeals={recurringMeals}
              allMealTypes={allMealTypes}
              onAddMealType={createCustomMealType}
              onDeleteMealType={deleteCustomMealType}
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