// client/src/components/planning/AddMealModal.jsx
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import './AddMealModal.css';
import MealSelector from '../../planning/MealSelector/MealSelector';

const AddMealModal = ({ onClose, selected, onSave, meals = [] }) => {
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedDays, setSelectedDays] = useState(selected ? [selected] : []);
  const [frequency, setFrequency] = useState('once');
  const [mealType, setMealType] = useState('dinner');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState('');

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    if (newFrequency === 'weekly') {
      setSelectedDays(DAYS_OF_WEEK);
    } else if (newFrequency === 'once' && selectedDays.length === 0) {
      setSelectedDays([DAYS_OF_WEEK[0]]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('AddMealModal handleSubmit called');
    console.log('Selected meal:', selectedMeal);
    console.log('Selected days:', selectedDays);
    console.log('Meal type:', mealType);

    if (!selectedMeal) {
      alert('Please select a meal');
      return;
    }

    if (selectedDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const scheduleData = {
      mealId: selectedMeal.id,
      mealType,
      days: selectedDays,
      frequency,
      startDate,
      endDate: frequency === 'once' ? null : endDate || null
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

  return (
    <div className='add-meal-overlay' onClick={onClose}>
      <div className='add-meal-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Add Meal to Schedule</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='add-meal-form'>
          {/* Meal Type Selection */}
          <div className='form-section'>
            <label className='section-label'>Meal Type</label>
            <div className='meal-type-grid'>
              {MEAL_TYPES.map(type => (
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

          {/* Frequency Selection */}
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
                  <span className='radio-description'>Add to specific dates only</span>
                </div>
              </label>

              <label className='radio-option'>
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={frequency === 'weekly'}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                />
                <div className='radio-content'>
                  <span className='radio-title'>Weekly Recurring</span>
                  <span className='radio-description'>Repeat every week</span>
                </div>
              </label>

              <label className='radio-option'>
                <input
                  type="radio"
                  name="frequency"
                  value="custom"
                  checked={frequency === 'custom'}
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                />
                <div className='radio-content'>
                  <span className='radio-title'>Custom Schedule</span>
                  <span className='radio-description'>Select specific days to repeat</span>
                </div>
              </label>
            </div>
          </div>

          {/* Day Selection */}
          <div className='form-section'>
            <label className='section-label'>
              {frequency === 'once' ? 'Select Date(s)' : 'Days of Week'}
            </label>
            <div className='days-grid'>
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  disabled={frequency === 'weekly'}
                  className={`day-btn ${selectedDays.includes(day) ? 'active' : ''} ${frequency === 'weekly' ? 'disabled' : ''}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {frequency === 'weekly' && (
              <p className='helper-text'>All days selected for weekly schedule</p>
            )}
          </div>

          {/* Date Range (for recurring schedules) */}
          {frequency !== 'once' && (
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