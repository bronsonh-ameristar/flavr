// client/src/components/planning/AddMealModal.jsx
import React, { useState } from 'react';
import { X, Trash2, Edit2, Eye } from 'lucide-react';
import './OccupiedSlotModal.css';

const OccupiedSlotModal = ({ onClose, deleteItem, openAddModal, openViewModal }) => {
  
  return (
    <div className='occupied-slot-overlay' onClick={onClose}>
      <div className='occupied-slot-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Select an Option</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className='occupied-slot-options'>
            <button onClick={deleteItem} className="btn-secondary">
              <Trash2 size={16} />
              Delete from Calendar
            </button>
            <button onClick={openViewModal} className="btn-primary">
              <Eye size={16} />
              View/Edit Meal
            </button>
            <button onClick={openAddModal} className="btn-primary">
              <Edit2 size={16} />
              Replace Meal
            </button>
        </div>
      </div>
    </div>
  )
};

export default OccupiedSlotModal;