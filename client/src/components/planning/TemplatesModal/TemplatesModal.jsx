import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Play, Edit2, Check, XCircle } from 'lucide-react';
import { useMealPlanTemplates } from '../../../hooks/useMealPlanTemplates';
import './TemplatesModal.css';

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TemplatesModal = ({ onClose, weekStart, onApplied }) => {
  const {
    templates,
    loading,
    error,
    fetchTemplates,
    deleteTemplate,
    updateTemplate,
    applyTemplate
  } = useMealPlanTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        if (selectedTemplate?.id === id) {
          setSelectedTemplate(null);
        }
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleStartEdit = (template) => {
    setEditingId(template.id);
    setEditName(template.name);
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) {
      alert('Template name cannot be empty');
      return;
    }

    try {
      await updateTemplate(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    } catch (err) {
      alert('Failed to rename: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate || !weekStart) return;

    const startDate = formatLocalDate(weekStart);

    try {
      const result = await applyTemplate(selectedTemplate.id, startDate, overwrite);
      setApplyMessage(result.message);
      if (onApplied) {
        onApplied();
      }
      setTimeout(() => setApplyMessage(''), 3000);
    } catch (err) {
      alert('Failed to apply template: ' + err.message);
    }
  };

  // Group template items by day for preview
  const getTemplatePreview = (template) => {
    if (!template?.items) return {};
    return template.items.reduce((acc, item) => {
      const day = DAYS_OF_WEEK[item.dayOfWeek];
      if (!acc[day]) acc[day] = [];
      acc[day].push(item);
      return acc;
    }, {});
  };

  return (
    <div className="templates-overlay" onClick={onClose}>
      <div className="templates-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FileText size={20} />
            Meal Plan Templates
          </h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">{error}</div>
          )}

          {applyMessage && (
            <div className="success-message">{applyMessage}</div>
          )}

          <div className="templates-layout">
            {/* Templates List */}
            <div className="templates-list-section">
              <h3>Your Templates</h3>

              {loading && <p className="loading-text">Loading...</p>}

              {!loading && templates.length === 0 && (
                <p className="empty-text">No templates saved yet. Use "Save Week as Template" from the planning page to create one.</p>
              )}

              <div className="templates-list">
                {templates.map(template => (
                  <div
                    key={template.id}
                    className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="template-info">
                      {editingId === template.id ? (
                        <div className="edit-name-form">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                          <button onClick={(e) => { e.stopPropagation(); handleSaveEdit(template.id); }}>
                            <Check size={16} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }}>
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="template-name">{template.name}</span>
                          <span className="template-count">{template.items?.length || 0} meals</span>
                        </>
                      )}
                    </div>
                    <div className="template-actions">
                      <button
                        className="edit-btn"
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(template); }}
                        title="Rename"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Preview */}
            <div className="template-preview-section">
              <h3>Template Preview</h3>

              {!selectedTemplate ? (
                <p className="empty-text">Select a template to preview</p>
              ) : (
                <>
                  <div className="preview-content">
                    {DAYS_OF_WEEK.map(day => {
                      const items = getTemplatePreview(selectedTemplate)[day] || [];
                      if (items.length === 0) return null;

                      return (
                        <div key={day} className="preview-day">
                          <h4>{day}</h4>
                          <div className="preview-meals">
                            {items.map((item, idx) => (
                              <div key={idx} className="preview-meal">
                                <span className={`meal-type-badge ${item.mealType}`}>
                                  {item.mealType}
                                </span>
                                <span className="meal-name">{item.meal?.name || 'Unknown'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="apply-section">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={overwrite}
                        onChange={(e) => setOverwrite(e.target.checked)}
                      />
                      Overwrite existing meals
                    </label>

                    <button
                      className="btn-apply"
                      onClick={handleApplyTemplate}
                      disabled={loading}
                    >
                      <Play size={16} />
                      Apply to Current Week
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesModal;
