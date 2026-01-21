import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useMealPlanTemplates } from '../../../hooks/useMealPlanTemplates';
import './SaveTemplateModal.css';

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SaveTemplateModal = ({ onClose, weekStart, mealPlans, onSaved }) => {
  const { saveWeekAsTemplate, loading, error } = useMealPlanTemplates();
  const [templateName, setTemplateName] = useState('');
  const [saveError, setSaveError] = useState('');

  // Get meals for preview
  const getMealsPreview = () => {
    const preview = {};
    Object.entries(mealPlans).forEach(([key, plan]) => {
      const dateStr = key.substring(0, 10);
      const mealType = key.substring(11);

      const planDate = new Date(dateStr + 'T00:00:00');
      const day = DAYS_OF_WEEK[planDate.getDay()];

      if (!preview[day]) preview[day] = [];
      preview[day].push({
        mealType,
        mealName: plan.meal?.name || 'Unknown'
      });
    });
    return preview;
  };

  const mealsPreview = getMealsPreview();
  const totalMeals = Object.keys(mealPlans).length;

  const handleSave = async () => {
    console.log('handleSave called', { templateName, totalMeals, weekStart });

    if (!templateName.trim()) {
      setSaveError('Please enter a template name');
      return;
    }

    if (totalMeals === 0) {
      setSaveError('No meals to save in this week');
      return;
    }

    try {
      setSaveError('');
      const startDate = formatLocalDate(weekStart);
      console.log('Saving template:', { startDate, templateName: templateName.trim() });
      const result = await saveWeekAsTemplate(startDate, templateName.trim());
      console.log('Template saved successfully:', result);
      alert('Template saved successfully!');
      if (onSaved) {
        onSaved();
      }
      onClose();
    } catch (err) {
      console.error('Error saving template:', err);
      setSaveError(err.message || 'Failed to save template');
    }
  };

  return (
    <div className="save-template-overlay" onClick={onClose}>
      <div className="save-template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FileText size={20} />
            Save Week as Template
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {(error || saveError) && (
            <div className="error-message">{error || saveError}</div>
          )}

          <div className="form-group">
            <label htmlFor="templateName">Template Name</label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Healthy Week, Family Favorites"
              maxLength={100}
            />
          </div>

          <div className="preview-section">
            <h3>Meals to be saved ({totalMeals})</h3>

            {totalMeals === 0 ? (
              <p className="empty-text">No meals planned for this week</p>
            ) : (
              <div className="preview-list">
                {DAYS_OF_WEEK.map(day => {
                  const meals = mealsPreview[day] || [];
                  if (meals.length === 0) return null;

                  return (
                    <div key={day} className="preview-day">
                      <span className="day-name">{day}</span>
                      <div className="day-meals">
                        {meals.map((meal, idx) => (
                          <span key={idx} className="meal-item">
                            <span className={`meal-type ${meal.mealType}`}>
                              {meal.mealType.charAt(0).toUpperCase()}
                            </span>
                            {meal.mealName}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={loading || totalMeals === 0}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
