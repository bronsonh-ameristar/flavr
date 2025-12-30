// client/src/components/planning/AddMealModal.jsx
import React, { useState, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import './AddMealModal.css';
import MealSelector from '../../planning/MealSelector/MealSelector';

const DEFAULT_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const AddMealModal = ({ onClose, selected, onSave, meals = [], selectedSlot = null, mealTypes = [] }) => {
  const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Use provided meal types or fall back to defaults
  const availableMealTypes = mealTypes.length > 0
    ? mealTypes.map(t => typeof t === 'string' ? t : t.name)
    : DEFAULT_MEAL_TYPES;

  // Determine initial day from selectedSlot if provided
  const initialDay = useMemo(() => {
    if (selectedSlot?.date) {
      const date = new Date(selectedSlot.date + 'T00:00:00');
      return DAYS_OF_WEEK[date.getDay()];
    }
    return null;
  }, [selectedSlot]);

  // Determine initial meal type from selectedSlot if provided
  const initialMealType = selectedSlot?.mealType || 'dinner';

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDays, setSelectedDays] = useState(initialDay ? [initialDay] : (selected ? [selected] : []));
  const [frequency, setFrequency] = useState('once');
  const [mealType, setMealType] = useState(initialMealType);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');

  // Flag to indicate if we're in "specific slot" mode
  const isSpecificSlot = !!selectedSlot;

  // Option to make recurring even when adding to specific slot
  const [makeRecurring, setMakeRecurring] = useState(false);

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    // Don't auto-select days, let user choose
    if (selectedDays.length === 0) {
      setSelectedDays([DAYS_OF_WEEK[0]]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('AddMealModal handleSubmit called');
    console.log('Selected meal:', selectedMeal);
    console.log('Selected days:', selectedDays);
    console.log('Meal type:', mealType);
    console.log('Make recurring:', makeRecurring);

    if (!selectedMeal) {
      alert('Please select a meal');
      return;
    }

    if (!isSpecificSlot && selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    // Calculate dayOfWeek for specific slot (for recurring)
    let dayOfWeek = null;
    if (isSpecificSlot && selectedSlot?.date) {
      const date = new Date(selectedSlot.date + 'T00:00:00');
      dayOfWeek = date.getDay();
    }

    const scheduleData = {
      mealId: selectedMeal.id,
      mealType,
      days: selectedDays,
      frequency: isSpecificSlot ? (makeRecurring ? 'recurring' : 'once') : frequency,
      startDate,
      endDate: frequency === 'once' ? null : endDate || null,
      // Include info for creating recurring meal
      makeRecurring: isSpecificSlot ? makeRecurring : (frequency === 'recurring'),
      dayOfWeek
    };

    console.log('Schedule data prepared:', scheduleData);

    if (onSave) {
      console.log('Calling onSave callback...');
      await onSave(scheduleData);
      console.log('onSave completed');
    } else {
      console.log('No onSave callback provided, closing modal');
      // If no onSave callback, just close
      onClose();
    }
  };

  // Format date for display
  const formatSlotDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <div className='add-meal-overlay' onClick={onClose}>
      <div className='add-meal-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>
            {isSpecificSlot
              ? `Add ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} for ${formatSlotDate(selectedSlot.date)}`
              : 'Add Meal to Schedule'
            }
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='add-meal-form'>
          {/* Meal Type Selection - show as info when specific slot, otherwise allow selection */}
          {isSpecificSlot ? (
            <div className='form-section'>
              <div className='slot-info'>
                <span className='slot-info-label'>Adding to:</span>
                <span className='slot-info-value'>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)} on {formatSlotDate(selectedSlot.date)}
                </span>
              </div>
              <label className='recurring-checkbox'>
                <input
                  type="checkbox"
                  checked={makeRecurring}
                  onChange={(e) => setMakeRecurring(e.target.checked)}
                />
                <span className='checkbox-content'>
                  <span className='checkbox-title'>Make this recurring</span>
                  <span className='checkbox-description'>
                    Automatically add this meal every {initialDay} for {mealType}
                  </span>
                </span>
              </label>
            </div>
          ) : (
            <div className='form-section'>
              <label className='section-label'>Meal Type</label>
              <div className='meal-type-grid'>
                {availableMealTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`meal-type-btn ${mealType === type ? 'active' : ''}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Frequency Selection - hide when specific slot is selected */}
          {!isSpecificSlot && (
            <div className='form-section'>
              <label className='section-label'>Frequency</label>
              <div className='frequency-options'>
                <label className='radio-option'>
                  <input
                    type="radio"
                    name="frequency"
                    value="once"
                    checked={frequency === 'once'}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                  />
                  <div className='radio-content'>
                    <span className='radio-title'>One-Time</span>
                    <span className='radio-description'>Add to this week only</span>
                  </div>
                </label>

                <label className='radio-option'>
                  <input
                    type="radio"
                    name="frequency"
                    value="recurring"
                    checked={frequency === 'recurring'}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                  />
                  <div className='radio-content'>
                    <span className='radio-title'>Recurring</span>
                    <span className='radio-description'>Repeat on selected days every week</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Day Selection - hide when specific slot is selected */}
          {!isSpecificSlot && (
            <div className='form-section'>
              <label className='section-label'>
                {frequency === 'once' ? 'Select Day(s) for This Week' : 'Select Days to Repeat Weekly'}
              </label>
              <div className='days-grid'>
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`day-btn ${selectedDays.includes(day) ? 'active' : ''}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {frequency === 'recurring' && selectedDays.length > 0 && (
                <p className='helper-text'>
                  This meal will repeat every {selectedDays.join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Date Range (for recurring schedules) - hide when specific slot is selected */}
          {!isSpecificSlot && frequency !== 'once' && (
            <div className='form-section'>
              <label className='section-label'>Schedule Period</label>
              <div className='date-range'>
                <div className='date-input-group'>
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className='date-input-group'>
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>
              <p className='helper-text'>Leave end date empty for indefinite schedule</p>
            </div>
          )}

          {/* Meal Selector */}
          <div className='form-section'>
            <label className='section-label'>
              Select Meal {selectedMeal && <span className='selected-indicator'>- {selectedMeal.name} selected</span>}
            </label>
            <div className='meal-selector'>
              <MealSelector
                meals={meals}
                onMealSelect={(meal) => setSelectedMeal(meal)}
                selectedMealId={selectedMeal?.id}
                isDragMode={true}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-add" disabled={!selectedMeal}>
              <Plus size={16} />
              Add Meal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMealModal;