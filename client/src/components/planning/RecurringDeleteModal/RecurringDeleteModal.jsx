// client/src/components/planning/RecurringDeleteModal/RecurringDeleteModal.jsx
import React from 'react';
import { X, Calendar, CalendarX, Trash2 } from 'lucide-react';
import './RecurringDeleteModal.css';

const RecurringDeleteModal = ({
  onClose,
  mealName,
  onDeleteThisOnly,
  onDeleteThisAndFuture,
  onDeleteRecurringRule
}) => {
  return (
    <div className='recurring-delete-overlay' onClick={onClose}>
      <div className='recurring-delete-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Delete Recurring Meal</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className='modal-body'>
          <p className='modal-description'>
            <strong>{mealName}</strong> is part of a recurring schedule. How would you like to delete it?
          </p>

          <div className='delete-options'>
            <button
              className='delete-option'
              onClick={onDeleteThisOnly}
            >
              <div className='option-icon'>
                <Calendar size={24} />
              </div>
              <div className='option-content'>
                <span className='option-title'>Remove This Instance Only</span>
                <span className='option-description'>
                  Remove the meal from this date only. Future occurrences will still appear.
                </span>
              </div>
            </button>

            <button
              className='delete-option delete-option-warning'
              onClick={onDeleteThisAndFuture}
            >
              <div className='option-icon'>
                <CalendarX size={24} />
              </div>
              <div className='option-content'>
                <span className='option-title'>Remove This & Future Instances</span>
                <span className='option-description'>
                  Remove from this date and stop the recurring schedule from this point forward.
                </span>
              </div>
            </button>

            <button
              className='delete-option delete-option-danger'
              onClick={onDeleteRecurringRule}
            >
              <div className='option-icon'>
                <Trash2 size={24} />
              </div>
              <div className='option-content'>
                <span className='option-title'>Delete Entire Recurring Schedule</span>
                <span className='option-description'>
                  Completely remove the recurring meal rule. Past instances will remain on the calendar.
                </span>
              </div>
            </button>
          </div>

          <div className='modal-footer'>
            <button className='btn-cancel' onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringDeleteModal;
