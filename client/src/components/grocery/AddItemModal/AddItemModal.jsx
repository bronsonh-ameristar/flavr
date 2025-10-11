// client/src/components/grocery/AddItemModal/AddItemModal.jsx
import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import './AddItemModal.css';

const AddItemModal = ({ onAdd, onClose, existingStores = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '1',
    unit: '',
    category: 'other',
    store: existingStores[0] || 'Unassigned'
  });

  const commonUnits = ['', 'cup', 'cups', 'tbsp', 'tsp', 'lb', 'lbs', 'oz', 'g', 'kg', 'ml', 'l', 'piece', 'pieces'];
  const categories = ['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other'];
  const commonStores = ['Whole Foods', 'Costco', 'Target', 'Walmart', 'Trader Joe\'s', 'Local Market', 'Unassigned'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter an item name');
      return;
    }

    onAdd(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="add-item-overlay" onClick={onClose}>
      <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Grocery Item</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-item-form">
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Apples"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="text"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                placeholder="e.g., 2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
              >
                <option value="">None</option>
                {commonUnits.map(unit => unit && (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="store">Store</label>
            {existingStores.length > 0 ? (
              <select
                id="store"
                value={formData.store}
                onChange={(e) => handleChange('store', e.target.value)}
              >
                {existingStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
                {!existingStores.includes('Unassigned') && (
                  <option value="Unassigned">Unassigned</option>
                )}
                {commonStores.filter(s => !existingStores.includes(s)).map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            ) : (
              <select
                id="store"
                value={formData.store}
                onChange={(e) => handleChange('store', e.target.value)}
              >
                {commonStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-add">
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;