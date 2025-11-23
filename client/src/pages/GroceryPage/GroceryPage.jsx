// client/src/pages/GroceryPage/GroceryPage.jsx - UPDATED WITH DIRECT UNIT CONVERTER
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Plus, Store, Trash2, Calendar, RefreshCw, X } from 'lucide-react';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import {
  consolidateIngredients,
  convertUnit,
  getUnitsInCategory,
  getUnitCategory
} from '../../utils/unitConverter';
import AddItemModal from '../../components/grocery/AddItemModal/AddItemModal';
import GroceryStoreSection from '../../components/grocery/GroceryStoreSection';
import './GroceryPage.css';

const GroceryPage = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [groceryList, setGroceryList] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [convertingItem, setConvertingItem] = useState(null);

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

  // Consolidate items directly with useMemo
  const consolidatedList = useMemo(() => {
    if (!groceryList || Object.keys(groceryList).length === 0) {
      return {};
    }

    const consolidated = {};
    Object.entries(groceryList).forEach(([storeName, items]) => {
      const consolidatedItems = consolidateIngredients(items);
      if (consolidatedItems.length > 0) {
        consolidated[storeName] = consolidatedItems;
      }
    });

    return consolidated;
  }, [groceryList]);

  // Calculate totals
  const totalItems = useMemo(() => {
    return Object.values(consolidatedList).reduce(
      (sum, items) => sum + items.length,
      0
    );
  }, [consolidatedList]);

  const completedItems = useMemo(() => {
    return Object.values(consolidatedList).reduce(
      (sum, items) => sum + items.filter(item => item.completed).length,
      0
    );
  }, [consolidatedList]);

  // Auto-generate grocery list on mount
  useEffect(() => {
    const autoGenerate = async () => {
      if (Object.keys(mealPlanning.mealPlans).length > 0 && !lastGenerated) {
        await handleGenerateFromPlanning(true);
      }
    };

    if (!mealPlanning.loading) {
      autoGenerate();
    }
  }, [mealPlanning.mealPlans, mealPlanning.loading]);

  const handleGenerateFromPlanning = async (silent = false) => {
    setLoading(true);
    try {
      const data = await mealPlanning.generateGroceryList();

      if (!data || !data.groceryList) {
        if (!silent) {
          alert('No meals planned for this week. Please add meals to your calendar first.');
        }
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
              store: store,
              completed: false,
              usedInMeals: item.usedInMeals || []
            });
          });
        });
      });

      setGroceryList(transformedList);
      setLastGenerated(new Date());

      if (!silent) {
        const totalItems = Object.values(transformedList).reduce((sum, items) => sum + items.length, 0);
        if (totalItems > 0) {
          alert(`Generated grocery list with ${totalItems} items from ${Object.keys(transformedList).length} stores!`);
        }
      }
    } catch (error) {
      console.error('Failed to generate grocery list:', error);
      if (!silent) {
        alert('Failed to generate grocery list: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const stores = ['all', ...Object.keys(consolidatedList)];

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

  const handleAddItem = (itemData) => {
    const storeName = itemData.store || 'Unassigned';

    const newItem = {
      id: `manual-${Date.now()}`,
      ...itemData,
      completed: false,
      usedInMeals: []
    };

    setGroceryList(prev => ({
      ...prev,
      [storeName]: [...(prev[storeName] || []), newItem]
    }));

    setShowAddModal(false);
  };

  const handleEditStore = (storeKey, itemId) => {
    const item = consolidatedList[storeKey].find(i => i.id === itemId);
    if (!item) return;

    setEditingItem({ ...item, oldStore: storeKey });
  };

  const handleUpdateStore = (newStore) => {
    if (!editingItem || !newStore) {
      setEditingItem(null);
      return;
    }

    const oldStore = editingItem.oldStore;

    setGroceryList(prev => {
      const updatedOldStore = prev[oldStore].filter(item => item.id !== editingItem.id);
      const updatedItem = { ...editingItem, store: newStore };
      const updatedNewStore = [...(prev[newStore] || []), updatedItem];

      const newList = { ...prev };

      if (updatedOldStore.length === 0) {
        delete newList[oldStore];
      } else {
        newList[oldStore] = updatedOldStore;
      }

      newList[newStore] = updatedNewStore;

      return newList;
    });

    setEditingItem(null);
  };

  const handleConvertUnit = (storeKey, item) => {
    setConvertingItem({ ...item, storeKey });
  };

  const handleUnitConversion = (newUnit) => {
    if (!convertingItem || !newUnit) {
      setConvertingItem(null);
      return;
    }

    const convertedQty = convertUnit(
      convertingItem.quantity,
      convertingItem.unit,
      newUnit
    );

    if (convertedQty === null) {
      alert('Cannot convert between these units');
      setConvertingItem(null);
      return;
    }

    // Update the actual grocery list (not just consolidated view)
    setGroceryList(prev => {
      const updatedList = { ...prev };
      const storeItems = [...(updatedList[convertingItem.storeKey] || [])];

      // Find all items with the same normalized name and update them all
      const normalizedName = convertingItem.normalizedName ||
        convertingItem.name.toLowerCase().trim()
          .replace(/\s+/g, ' ')
          .replace(/\b(fresh|dried|frozen|chopped|diced|minced|sliced|whole|ground)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

      storeItems.forEach((item, index) => {
        const itemNormalizedName = item.name.toLowerCase().trim()
          .replace(/\s+/g, ' ')
          .replace(/\b(fresh|dried|frozen|chopped|diced|minced|sliced|whole|ground)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (itemNormalizedName === normalizedName) {
          // Convert this item's quantity to the new unit
          const itemConverted = convertUnit(item.quantity, item.unit, newUnit);
          if (itemConverted !== null) {
            storeItems[index] = {
              ...item,
              quantity: Math.round(itemConverted * 100) / 100,
              unit: newUnit
            };
          }
        }
      });

      updatedList[convertingItem.storeKey] = storeItems;
      return updatedList;
    });

    setConvertingItem(null);
  };

  const getAvailableUnits = (item) => {
    const category = getUnitCategory(item.unit || '');
    return getUnitsInCategory(category);
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
      return consolidatedList;
    }
    return { [selectedStore]: consolidatedList[selectedStore] };
  };

  const filteredStores = getFilteredStores();

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
            onClick={() => setShowAddModal(true)}
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
            onClick={() => handleGenerateFromPlanning(false)}
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
              onClick={() => handleGenerateFromPlanning(false)}
              disabled={loading || Object.keys(mealPlanning.mealPlans).length === 0}
            >
              <Calendar size={16} />
              Generate from Meal Plan
            </button>
            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
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
            {Object.entries(filteredStores).map(([storeName, items]) => (
              <GroceryStoreSection
                key={storeName}
                storeName={storeName}
                items={items}
                onToggleComplete={toggleItemComplete}
                onRemove={removeItem}
                onEditStore={handleEditStore}
                onConvertUnit={handleConvertUnit}
              />
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating grocery list from your meal plan...</p>
        </div>
      )}

      {showAddModal && (
        <AddItemModal
          onAdd={handleAddItem}
          onClose={() => setShowAddModal(false)}
          existingStores={Object.keys(consolidatedList)}
        />
      )}

      {editingItem && (
        <div className="store-edit-modal" onClick={() => setEditingItem(null)}>
          <div className="store-edit-content" onClick={(e) => e.stopPropagation()}>
            <div className="store-edit-header">
              <h3>Change Store for "{editingItem.name}"</h3>
              <button onClick={() => setEditingItem(null)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="store-edit-body">
              <p>Select a new store:</p>
              <div className="store-options">
                {[...new Set([...Object.keys(consolidatedList), 'Whole Foods', 'Costco', 'Target', 'Walmart', 'Trader Joe\'s'])].map(store => (
                  <button
                    key={store}
                    className={`store-option ${store === editingItem.oldStore ? 'current' : ''}`}
                    onClick={() => handleUpdateStore(store)}
                  >
                    <Store size={16} />
                    {store}
                  </button>
                ))}
              </div>
              <div className="custom-store">
                <input
                  type="text"
                  placeholder="Or enter custom store name..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleUpdateStore(e.target.value.trim());
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {convertingItem && (
        <div className="unit-convert-modal" onClick={() => setConvertingItem(null)}>
          <div className="unit-convert-content" onClick={(e) => e.stopPropagation()}>
            <div className="unit-convert-header">
              <h3>Convert Unit for "{convertingItem.name}"</h3>
              <button onClick={() => setConvertingItem(null)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="unit-convert-body">
              <p className="current-unit">
                Current: <strong>{convertingItem.displayQuantity || convertingItem.quantity} {convertingItem.unit}</strong>
              </p>
              <p>Select new unit:</p>
              <div className="unit-options">
                {getAvailableUnits(convertingItem).map(unit => (
                  <button
                    key={unit}
                    className={`unit-option ${unit === convertingItem.unit ? 'current' : ''}`}
                    onClick={() => handleUnitConversion(unit)}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroceryPage;