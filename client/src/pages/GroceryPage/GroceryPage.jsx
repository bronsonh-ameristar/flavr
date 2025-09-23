// client/src/pages/GroceryPage/GroceryPage.jsx
import React, { useState } from 'react';
import { ShoppingCart, Check, Plus, Store, Trash2 } from 'lucide-react';
import './GroceryPage.css';

const GroceryPage = () => {
  const [selectedStore, setSelectedStore] = useState('all');

  // Mock data for grocery list organized by store
  const [groceryList, setGroceryList] = useState({
    'Whole Foods': [
      { id: 1, name: 'Organic Spinach', quantity: '2 bunches', category: 'Produce', completed: false },
      { id: 2, name: 'Cherry Tomatoes', quantity: '1 container', category: 'Produce', completed: false },
      { id: 3, name: 'Free-range Chicken Breast', quantity: '2 lbs', category: 'Meat', completed: true },
      { id: 4, name: 'Greek Yogurt', quantity: '32 oz', category: 'Dairy', completed: false },
    ],
    'Costco': [
      { id: 5, name: 'Rolled Oats', quantity: '5 lb bag', category: 'Pantry', completed: false },
      { id: 6, name: 'Olive Oil', quantity: '1 large bottle', category: 'Pantry', completed: false },
      { id: 7, name: 'Frozen Berries', quantity: '2 lb bag', category: 'Frozen', completed: false },
    ],
    'Target': [
      { id: 8, name: 'Paper Towels', quantity: '1 pack', category: 'Household', completed: false },
      { id: 9, name: 'Dish Soap', quantity: '1 bottle', category: 'Household', completed: true },
    ]
  });

  const stores = ['all', ...Object.keys(groceryList)];

  const toggleItemComplete = (storeKey, itemId) => {
    setGroceryList(prev => ({
      ...prev,
      [storeKey]: prev[storeKey].map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const removeItem = (storeKey, itemId) => {
    setGroceryList(prev => ({
      ...prev,
      [storeKey]: prev[storeKey].filter(item => item.id !== itemId)
    }));
  };

  const getFilteredStores = () => {
    if (selectedStore === 'all') {
      return groceryList;
    }
    return { [selectedStore]: groceryList[selectedStore] };
  };

  const getTotalItems = () => {
    return Object.values(groceryList).flat().length;
  };

  const getCompletedItems = () => {
    return Object.values(groceryList).flat().filter(item => item.completed).length;
  };

  const filteredStores = getFilteredStores();

  return (
    <div className="grocery-page">
      <div className="grocery-header">
        <div className="header-content">
          <h1>Grocery List</h1>
          <div className="progress-info">
            <span>{getCompletedItems()} of {getTotalItems()} items completed</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(getCompletedItems() / getTotalItems()) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="grocery-actions">
          <button className="btn-secondary">
            <Plus size={16} />
            Add Item
          </button>
          <button className="btn-primary">
            <ShoppingCart size={16} />
            New List from Meals
          </button>
        </div>
      </div>

      <div className="store-filter">
        <div className="filter-label">
          <Store size={20} />
          <span>Filter by store:</span>
        </div>
        <select 
          value={selectedStore} 
          onChange={(e) => setSelectedStore(e.target.value)}
          className="store-select"
        >
          {stores.map(store => (
            <option key={store} value={store}>
              {store === 'all' ? 'All Stores' : store}
            </option>
          ))}
        </select>
      </div>

      <div className="grocery-lists">
        {Object.entries(filteredStores).map(([storeName, items]) => {
          const storeCompleted = items.filter(item => item.completed).length;
          const storeTotal = items.length;
          
          return (
            <div key={storeName} className="store-section">
              <div className="store-header">
                <div className="store-info">
                  <h2>{storeName}</h2>
                  <span className="store-progress">
                    {storeCompleted}/{storeTotal} completed
                  </span>
                </div>
                <div className="store-progress-bar">
                  <div 
                    className="store-progress-fill" 
                    style={{ width: `${storeTotal > 0 ? (storeCompleted / storeTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="items-list">
                {items.map(item => (
                  <div key={item.id} className={`grocery-item ${item.completed ? 'completed' : ''}`}>
                    <button 
                      className="complete-btn"
                      onClick={() => toggleItemComplete(storeName, item.id)}
                    >
                      {item.completed ? <Check size={16} /> : <div className="empty-check"></div>}
                    </button>
                    
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-details">
                        <span className="item-quantity">{item.quantity}</span>
                        <span className="item-category">{item.category}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(storeName, item.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(filteredStores).length === 0 && (
        <div className="empty-state">
          <ShoppingCart size={48} />
          <h3>No grocery items found</h3>
          <p>Add items manually or generate a list from your planned meals.</p>
          <button className="btn-primary">
            <Plus size={16} />
            Add Your First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default GroceryPage;