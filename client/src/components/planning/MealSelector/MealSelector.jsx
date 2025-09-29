import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Clock, Users, Search } from 'lucide-react';
import './MealSelector.css';

const DraggableMealCard = ({ meal, onSelect, isDragMode }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: meal.id.toString(),
    disabled: !isDragMode
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`meal-selector-card ${isDragging ? 'dragging' : ''}`}
      onClick={() => !isDragMode && onSelect && onSelect(meal.id)}
    >
      <img src={meal.imageUrl} alt={meal.name} />
      <div className="meal-info">
        <h4>{meal.name}</h4>
        <div className="meal-meta">
          <span><Clock size={12} /> {(meal.prepTime || 0) + (meal.cookTime || 0)}min</span>
          <span><Users size={12} /> {meal.servings}</span>
        </div>
        <span className={`category ${meal.category}`}>{meal.category}</span>
      </div>
    </div>
  );
};

const MealSelector = ({ meals, onMealSelect, isDragMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || meal.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="meal-selector">
      <div className="selector-header">
        <h3>{isDragMode ? 'Drag Meals to Calendar' : 'Select a Meal'}</h3>
        <p>{isDragMode ? 'Drag and drop meals onto calendar slots' : 'Click on a meal to add it'}</p>
      </div>

      <div className="selector-filters">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search meals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="meals-grid">
        {filteredMeals.map(meal => (
          <DraggableMealCard
            key={meal.id}
            meal={meal}
            onSelect={onMealSelect}
            isDragMode={isDragMode}
          />
        ))}
      </div>

      {filteredMeals.length === 0 && (
        <div className="no-meals">
          <p>No meals found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default MealSelector;