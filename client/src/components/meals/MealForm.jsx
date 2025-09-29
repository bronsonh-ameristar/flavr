// client/src/components/meals/MealForm/MealForm.jsx
import React, { useState } from 'react';
import { Plus, Minus, Save, X } from 'lucide-react';
import './MealForm.css';

const MealForm = ({ meal = null, onSave, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    description: meal?.description || '',
    prepTime: meal?.prepTime || '',
    cookTime: meal?.cookTime || '',
    servings: meal?.servings || 4,
    difficulty: meal?.difficulty || 'easy',
    category: meal?.category || 'dinner',
    instructions: meal?.instructions || '',
    imageUrl: meal?.imageUrl || '',
    ingredients: meal?.ingredients || [{ name: '', quantity: '', unit: '', category: 'pantry' }]
  });

  const [errors, setErrors] = useState({});

  const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const difficulties = ['easy', 'medium', 'hard'];
  const ingredientCategories = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other'];
  const commonUnits = ['cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'piece', 'pieces', 'clove', 'cloves'];

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (!formData.servings || formData.servings < 1) {
      newErrors.servings = 'Servings must be at least 1';
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

    const submitData = {
      ...formData,
      ingredients: validIngredients,
      prepTime: formData.prepTime ? parseInt(formData.prepTime) : null,
      cookTime: formData.cookTime ? parseInt(formData.cookTime) : null,
      servings: parseInt(formData.servings)
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
            <h3>Instructions</h3>
            <div className="form-group">
              <textarea
                value={formData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Step-by-step cooking instructions..."
                rows="6"
                className="instructions-textarea"
              />
            </div>
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