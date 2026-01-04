// client/src/components/meals/MealForm/MealForm.jsx
import React, { useState } from 'react';
import { Plus, Minus, Save, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import './MealForm.css';

const STEP_CATEGORIES = [
  { value: 'prep', label: 'Prep' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'assembly', label: 'Assembly' },
  { value: 'resting', label: 'Resting' }
];

const MealForm = ({ meal = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    description: meal?.description || '',
    prepTime: meal?.prepTime || '',
    cookTime: meal?.cookTime || '',
    servings: meal?.servings || 4,
    difficulty: meal?.difficulty || 'easy',
    category: meal?.category || 'dinner',
    cuisineType: meal?.cuisineType || '',
    instructions: meal?.instructions || '',
    imageUrl: meal?.imageUrl || '',
    ingredients: meal?.ingredients || [{ name: '', quantity: '', unit: '', category: 'pantry' }],
    structuredInstructions: meal?.structuredInstructions || [],
    // Nutrition fields
    calories: meal?.calories || '',
    protein: meal?.protein || '',
    carbs: meal?.carbs || '',
    fat: meal?.fat || ''
  });

  const [useStructuredInstructions, setUseStructuredInstructions] = useState(
    meal?.structuredInstructions && meal.structuredInstructions.length > 0
  );

  const [errors, setErrors] = useState({});

  const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const difficulties = ['easy', 'medium', 'hard'];
  const cuisineTypes = ['Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 'French', 'American', 'Mediterranean', 'Greek', 'Spanish', 'Korean', 'Vietnamese', 'Middle Eastern', 'Caribbean', 'African', 'British', 'German', 'Other'];
  const ingredientCategories = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other'];
  const commonUnits = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'piece', 'pieces', 'clove', 'cloves'];
  const commonStores = ['Whole Foods', 'Costco', 'Target', 'Walmart', 'Trader Joe\'s', 'Local Market', 'Other'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '', category: 'pantry' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        ingredients: newIngredients
      }));
    }
  };

  // Structured instructions handlers
  const addStep = () => {
    const newStep = {
      stepNumber: formData.structuredInstructions.length + 1,
      action: '',
      duration: 0,
      ingredientRefs: [],
      category: 'prep'
    };
    setFormData(prev => ({
      ...prev,
      structuredInstructions: [...prev.structuredInstructions, newStep]
    }));
  };

  const removeStep = (index) => {
    const newSteps = formData.structuredInstructions
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setFormData(prev => ({
      ...prev,
      structuredInstructions: newSteps
    }));
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.structuredInstructions];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      structuredInstructions: newSteps
    }));
  };

  const moveStep = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.structuredInstructions.length) return;

    const newSteps = [...formData.structuredInstructions];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];

    // Renumber steps
    newSteps.forEach((step, i) => {
      step.stepNumber = i + 1;
    });

    setFormData(prev => ({
      ...prev,
      structuredInstructions: newSteps
    }));
  };

  const toggleIngredientRef = (stepIndex, ingredientName) => {
    const step = formData.structuredInstructions[stepIndex];
    const refs = step.ingredientRefs || [];
    const newRefs = refs.includes(ingredientName)
      ? refs.filter(r => r !== ingredientName)
      : [...refs, ingredientName];

    handleStepChange(stepIndex, 'ingredientRefs', newRefs);
  };

  // Get valid ingredient names for reference selection
  const getIngredientNames = () => {
    return formData.ingredients
      .filter(ing => ing.name.trim())
      .map(ing => ing.name.trim());
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (!formData.servings || formData.servings < 1) {
      newErrors.servings = 'Servings must be at least 1';
    }

    if (!formData.imageUrl) {
      formData.imageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400"
    }

    // Validate ingredients
    const validIngredients = formData.ingredients.filter(ing => ing.name.trim() && ing.quantity.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Filter out empty ingredients
    const validIngredients = formData.ingredients.filter(ing => 
      ing.name.trim() && ing.quantity.trim()
    );

    // Validate structured instructions if using them
    const validStructuredInstructions = useStructuredInstructions
      ? formData.structuredInstructions.filter(step => step.action.trim())
      : null;

    const submitData = {
      ...formData,
      ingredients: validIngredients,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
      cookTime: formData.cookTime ? parseInt(formData.cookTime) : null,
      servings: parseInt(formData.servings),
      // Parse nutrition fields - empty strings become null
      calories: formData.calories !== '' ? parseInt(formData.calories) : null,
      protein: formData.protein !== '' ? parseInt(formData.protein) : null,
      carbs: formData.carbs !== '' ? parseInt(formData.carbs) : null,
      fat: formData.fat !== '' ? parseInt(formData.fat) : null,
      // Include structured instructions if enabled and has valid steps
      structuredInstructions: validStructuredInstructions && validStructuredInstructions.length > 0
        ? validStructuredInstructions.map((step, index) => ({
            ...step,
            stepNumber: index + 1,
            duration: parseInt(step.duration) || 0
          }))
        : null
    };

    try {
      await onSave(submitData);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <div className="meal-form-overlay">
      <div className="meal-form-container">
        <div className="meal-form-header">
          <h2>{meal ? 'Edit Recipe' : 'Create New Recipe'}</h2>
          <button type="button" onClick={onCancel} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="meal-form">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Recipe Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter recipe name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cuisineType">Cuisine Type</label>
              <select
                id="cuisineType"
                value={formData.cuisineType}
                onChange={(e) => handleInputChange('cuisineType', e.target.value)}
              >
                <option value="">Select Cuisine Type</option>
                {cuisineTypes.map(cuisine => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the recipe"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prepTime">Prep Time (minutes)</label>
                <input
                  type="number"
                  id="prepTime"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange('prepTime', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cookTime">Cook Time (minutes)</label>
                <input
                  type="number"
                  id="cookTime"
                  value={formData.cookTime}
                  onChange={(e) => handleInputChange('cookTime', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="servings">Servings *</label>
                <input
                  type="number"
                  id="servings"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                  min="1"
                  className={errors.servings ? 'error' : ''}
                />
                {errors.servings && <span className="field-error">{errors.servings}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (optional)</label>
              <input
                type="url"
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Nutrition Information (per serving)</h3>
            <div className="form-row nutrition-row">
              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  type="number"
                  id="calories"
                  value={formData.calories}
                  onChange={(e) => handleInputChange('calories', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="protein">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  value={formData.protein}
                  onChange={(e) => handleInputChange('protein', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="carbs">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange('carbs', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="fat">Fat (g)</label>
                <input
                  type="number"
                  id="fat"
                  value={formData.fat}
                  onChange={(e) => handleInputChange('fat', e.target.value)}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Ingredients *</h3>
              <button type="button" onClick={addIngredient} className="add-ingredient-btn">
                <Plus size={16} />
                Add Ingredient
              </button>
            </div>
            
            {errors.ingredients && (
              <div className="field-error">{errors.ingredients}</div>
            )}

            <div className="ingredients-list">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    className="ingredient-name"
                  />
                  
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    className="ingredient-quantity"
                  />
                  
                  <select
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    className="ingredient-unit"
                  >
                    <option value="">Unit</option>
                    {commonUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  
                  <select
                    value={ingredient.category}
                    onChange={(e) => handleIngredientChange(index, 'category', e.target.value)}
                    className="ingredient-category"
                  >
                    {ingredientCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={ingredient.store || ''}
                    onChange={(e) => handleIngredientChange(index, 'store', e.target.value)}
                    className="ingredient-store"
                  >
                    <option value="">Store (optional)</option>
                    {commonStores.map(store => (
                      <option key={store} value={store}>{store}</option>
                    ))}
                  </select>
                  
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="remove-ingredient-btn"
                    disabled={formData.ingredients.length === 1}
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="section-header instructions-header">
              <h3>Instructions</h3>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={useStructuredInstructions}
                  onChange={(e) => {
                    setUseStructuredInstructions(e.target.checked);
                    if (e.target.checked && formData.structuredInstructions.length === 0) {
                      addStep();
                    }
                  }}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Use Structured Steps</span>
              </label>
            </div>

            {!useStructuredInstructions ? (
              <div className="form-group">
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Step-by-step cooking instructions..."
                  rows="6"
                  className="instructions-textarea"
                />
              </div>
            ) : (
              <div className="structured-instructions">
                <p className="helper-text">
                  Add structured steps for better meal prep planning. Each step can have a duration and linked ingredients.
                </p>

                {formData.structuredInstructions.map((step, index) => (
                  <div key={index} className="instruction-step">
                    <div className="step-header">
                      <div className="step-number">Step {step.stepNumber}</div>
                      <div className="step-controls">
                        <button
                          type="button"
                          onClick={() => moveStep(index, -1)}
                          disabled={index === 0}
                          className="step-move-btn"
                          title="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(index, 1)}
                          disabled={index === formData.structuredInstructions.length - 1}
                          className="step-move-btn"
                          title="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="step-remove-btn"
                          title="Remove step"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="step-content">
                      <div className="step-row">
                        <div className="form-group step-action">
                          <label>Action</label>
                          <textarea
                            value={step.action}
                            onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                            placeholder="What to do in this step..."
                            rows="2"
                          />
                        </div>
                      </div>

                      <div className="step-row step-meta">
                        <div className="form-group step-duration">
                          <label>Duration (min)</label>
                          <input
                            type="number"
                            value={step.duration}
                            onChange={(e) => handleStepChange(index, 'duration', e.target.value)}
                            min="0"
                            placeholder="0"
                          />
                        </div>

                        <div className="form-group step-category">
                          <label>Category</label>
                          <select
                            value={step.category}
                            onChange={(e) => handleStepChange(index, 'category', e.target.value)}
                          >
                            {STEP_CATEGORIES.map(cat => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {getIngredientNames().length > 0 && (
                        <div className="step-ingredients">
                          <label>Ingredients Used</label>
                          <div className="ingredient-chips">
                            {getIngredientNames().map(name => (
                              <button
                                key={name}
                                type="button"
                                className={`ingredient-chip ${(step.ingredientRefs || []).includes(name) ? 'selected' : ''}`}
                                onClick={() => toggleIngredientRef(index, name)}
                              >
                                {name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addStep} className="add-step-btn">
                  <Plus size={16} />
                  Add Step
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="save-btn">
              <Save size={16} />
              {isLoading ? 'Saving...' : (meal ? 'Update Recipe' : 'Create Recipe')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealForm;