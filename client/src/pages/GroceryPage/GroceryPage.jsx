// client/src/pages/GroceryPage/GroceryPage.jsx - COMPLETE REPLACEMENT
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Check, Plus, Store, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import './GroceryPage.css';

const GroceryPage = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [groceryList, setGroceryList] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);

  // Get current week dates
  const getWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return {
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0]
    };
  };

  const { startDate, endDate } = getWeekDates();
  const mealPlanning = useMealPlanning(startDate, endDate);

  // Auto-generate grocery list on mount if there are meal plans
  useEffect(() => {
    const autoGenerate = async () => {
      if (Object.keys(mealPlanning.mealPlans).length > 0 && !lastGenerated) {
        await handleGenerateFromPlanning();
      }
    };
    
    if (!mealPlanning.loading) {
      autoGenerate();
    }
  }, [mealPlanning.mealPlans, mealPlanning.loading]);

  const handleGenerateFromPlanning = async () => {
    setLoading(true);
    try {
      const data = await mealPlanning.generateGroceryList();
      
      if (!data || !data.groceryList) {
        alert('No meals planned for this week. Please add meals to your calendar first.');
        return;
      }

      // Transform data for display
      const transformedList = {};
      Object.entries(data.groceryList).forEach(([store, categories]) => {
        if (!transformedList[store]) {
          transformedList[store] = [];
        }
        
        Object.entries(categories).forEach(([category, items]) => {
          items.forEach((item) => {
            transformedList[store].push({
              id: `${store}-${item.name}-${Date.now()}-${Math.random()}`,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit || '',
              category: item.category || 'other',
              completed: false,
              usedInMeals: item.usedInMeals || []
            });
          });
        });
      });
      
      setGroceryList(transformedList);
      setLastGenerated(new Date());
      
      const totalItems = Object.values(transformedList).reduce((sum, items) => sum + items.length, 0);
      if (totalItems > 0) {
        alert(`Generated grocery list with ${totalItems} items from ${Object.keys(transformedList).length} stores!`);
      }
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
      alert('Failed to generate grocery list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

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
    setGroceryList(prev => {
      const newStoreItems = prev[storeKey].filter(item => item.id !== itemId);
      
      // If store has no items left, remove the store
      if (newStoreItems.length === 0) {
        const { [storeKey]: removed, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [storeKey]: newStoreItems
      };
    });
  };

  const addManualItem = () => {
    const storeName = prompt('Enter store name:', 'Unassigned');
    if (!storeName) return;
    
    const itemName = prompt('Enter item name:');
    if (!itemName) return;
    
    const quantity = prompt('Enter quantity:', '1');
    
    const newItem = {
      id: `manual-${Date.now()}`,
      name: itemName,
      quantity: quantity || '1',
      unit: '',
      category: 'other',
      completed: false,
      usedInMeals: []
    };
    
    setGroceryList(prev => ({
      ...prev,
      [storeName]: [...(prev[storeName] || []), newItem]
    }));
  };

  const clearCompleted = () => {
    if (!window.confirm('Clear all completed items?')) return;
    
    const newList = {};
    Object.entries(groceryList).forEach(([store, items]) => {
      const remainingItems = items.filter(item => !item.completed);
      if (remainingItems.length > 0) {
        newList[store] = remainingItems;
      }
    });
    
    setGroceryList(newList);
  };

  const getFilteredStores = () => {
    if (selectedStore === 'all') {
      return groceryList;
    }
    return { [selectedStore]: groceryList[selectedStore] };
  };

  const getTotalItems = () => {
    return Object.values(groceryList).reduce((sum, items) => sum + items.length, 0);
  };

  const getCompletedItems = () => {
    return Object.values(groceryList).reduce((sum, items) => 
      sum + items.filter(item => item.completed).length, 0
    );
  };

  const filteredStores = getFilteredStores();
  const totalItems = getTotalItems();
  const completedItems = getCompletedItems();

  return (
    <div className="grocery-page">
      <div className="grocery-header">
        <div className="header-content">
          <h1>Grocery List</h1>
          {totalItems > 0 && (
            <div className="progress-info">
              <span>{completedItems} of {totalItems} items completed</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          )}
          {lastGenerated && (
            <p className="last-updated">
              Last generated: {lastGenerated.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="grocery-actions">
          <button 
            className="btn-secondary"
            onClick={addManualItem}
          >
            <Plus size={16} />
            Add Item
          </button>
          <button 
            className="btn-secondary"
            onClick={clearCompleted}
            disabled={completedItems === 0}
          >
            <Trash2 size={16} />
            Clear Completed
          </button>
          <button 
            className="btn-primary"
            onClick={handleGenerateFromPlanning}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="spinning" /> : <Calendar size={16} />}
            {loading ? 'Generating...' : 'Regenerate from Meal Plan'}
          </button>
        </div>
      </div>

      {totalItems === 0 && !loading && (
        <div className="empty-state">
          <ShoppingCart size={64} />
          <h3>No Items in Your Grocery List</h3>
          <p>Generate a grocery list from your meal plan or add items manually.</p>
          <div className="empty-actions">
            <button 
              className="btn-primary"
              onClick={handleGenerateFromPlanning}
              disabled={loading || Object.keys(mealPlanning.mealPlans).length === 0}
            >
              <Calendar size={16} />
              Generate from Meal Plan
            </button>
            <button className="btn-secondary" onClick={addManualItem}>
              <Plus size={16} />
              Add Item Manually
            </button>
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <>
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
                          <div className="item-main">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">
                              {item.quantity}{item.unit ? ' ' + item.unit : ''}
                            </span>
                          </div>
                          {item.usedInMeals && item.usedInMeals.length > 0 && (
                            <div className="item-meals">
                              Used in: {item.usedInMeals.join(', ')}
                            </div>
                          )}
                          <span className="item-category">{item.category}</span>
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
        </>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating grocery list from your meal plan...</p>
        </div>
      )}
    </div>
  );
};

export default GroceryPage;