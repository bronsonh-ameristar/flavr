// client/src/components/planning/AddMealModal.jsx
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useMeals } from '../../../hooks/useMeals'
import './AddMealModal.css';
import MealSelector from '../../planning/MealSelector/MealSelector';

const AddMealModal = ({ onClose, selected }) => {
  
  const [selectedDays, setSelectedDays] = useState(selected ? [selected] : []);
  const { meals } = useMeals();

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleChange = (field, value) => {
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
          <div className='meal-schedule'>
            add days here
          </div>
          <div className='meal-selector'>
            <MealSelector
              meals={meals}
              onMealSelect={null}
              isDragMode={true}
            />
          </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-add">
            <Plus size={16} />
              Add Meal
          </button>
        </div>
        </form>
      </div>
    </div>
  )
};

export default AddMealModal;