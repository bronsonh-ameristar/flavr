// client/src/pages/GroceryPage/GroceryPage.jsx - UPDATED WITH DIRECT UNIT CONVERTER
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingCart, Plus, Store, Trash2, Calendar, RefreshCw, X } from 'lucide-react';
import { useMealPlanning } from '../../hooks/useMealPlanning';
import MealsService from '../../services/mealsService';
import GroceryItemService from '../../services/groceryItemService';
import {
  consolidateIngredients,
  convertUnit,
  getUnitsInCategory,
  getUnitCategory
} from '../../utils/unitConverter';
import AddItemModal from '../../components/grocery/AddItemModal/AddItemModal';
import GroceryStoreSection from '../../components/grocery/GroceryStoreSection';
import './GroceryPage.css';

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GroceryPage = () => {
  const [selectedStore, setSelectedStore] = useState('all');
  const [groceryList, setGroceryList] = useState({});
  const [manualItems, setManualItems] = useState([]); // Persisted manual items from DB
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
      startDate: formatLocalDate(weekStart),
      endDate: formatLocalDate(weekEnd)
    };
  };

  const { startDate, endDate } = getWeekDates();
  const mealPlanning = useMealPlanning(startDate, endDate);

  // Fetch meal plans on mount
  useEffect(() => {
    mealPlanning.fetchMealPlans();
  }, [mealPlanning.fetchMealPlans]);

  // Load manual grocery items from database
  const loadManualItems = useCallback(async () => {
    try {
      const response = await GroceryItemService.getAllItems();
      setManualItems(response.data || []);
    } catch (error) {
      console.error('Failed to load manual grocery items:', error);
    }
  }, []);

  // Fetch manual items on mount
  useEffect(() => {
    loadManualItems();
  }, [loadManualItems]);

  // Consolidate items directly with useMemo (includes both meal-based and manual items)
  const consolidatedList = useMemo(() => {
    // Start with meal-based grocery list
    const combined = { ...groceryList };

    // Add manual items from database
    manualItems.forEach(item => {
      const store = item.store || 'Unassigned';
      if (!combined[store]) {
        combined[store] = [];
      }
      combined[store].push({
        id: `manual-db-${item.id}`,
        dbId: item.id, // Keep reference to database ID
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '',
        category: item.category || 'other',
        store: store,
        completed: item.completed,
        usedInMeals: [],
        isManualItem: true // Flag to identify manual items
      });
    });

    if (Object.keys(combined).length === 0) {
      return {};
    }

    const consolidated = {};
    Object.entries(combined).forEach(([storeName, items]) => {
      const consolidatedItems = consolidateIngredients(items);
      if (consolidatedItems.length > 0) {
        consolidated[storeName] = consolidatedItems;
      }
    });

    return consolidated;
  }, [groceryList, manualItems]);

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
              usedInMeals: item.usedInMeals || [],
              ingredientIds: item.ingredientIds || []
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

  const toggleItemComplete = async (storeKey, itemId) => {
    // Check if this is a manual item from database
    if (itemId.startsWith('manual-db-')) {
      const dbId = parseInt(itemId.replace('manual-db-', ''));
      try {
        await GroceryItemService.toggleItemCompleted(dbId);
        // Update local state
        setManualItems(prev =>
          prev.map(item =>
            item.id === dbId ? { ...item, completed: !item.completed } : item
          )
        );
      } catch (error) {
        console.error('Failed to toggle item:', error);
      }
      return;
    }

    // Handle meal-based items (local state only)
    setGroceryList(prev => ({
      ...prev,
      [storeKey]: prev[storeKey].map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const removeItem = async (storeKey, itemId) => {
    // Check if this is a manual item from database
    if (itemId.startsWith('manual-db-')) {
      const dbId = parseInt(itemId.replace('manual-db-', ''));
      try {
        await GroceryItemService.deleteItem(dbId);
        // Update local state
        setManualItems(prev => prev.filter(item => item.id !== dbId));
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
      return;
    }

    // Handle meal-based items (local state only)
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

  const handleAddItem = async (itemData) => {
    try {
      // Persist to database
      const response = await GroceryItemService.createItem({
        name: itemData.name,
        quantity: itemData.quantity || '1',
        unit: itemData.unit,
        category: itemData.category || 'other',
        store: itemData.store || 'Unassigned'
      });

      // Add to local state
      setManualItems(prev => [...prev, response.data]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Failed to add item: ' + error.message);
    }
  };

  const handleEditStore = (storeKey, itemId) => {
    const item = consolidatedList[storeKey].find(i => i.id === itemId);
    if (!item) return;

    setEditingItem({ ...item, oldStore: storeKey });
  };

  const handleUpdateStore = async (newStore) => {
    if (!editingItem || !newStore) {
      setEditingItem(null);
      return;
    }

    const oldStore = editingItem.oldStore;

    // Check if this is a manual item from database
    if (editingItem.id.startsWith('manual-db-')) {
      const dbId = parseInt(editingItem.id.replace('manual-db-', ''));
      try {
        await GroceryItemService.updateItemStore(dbId, newStore);
        // Update local state
        setManualItems(prev =>
          prev.map(item =>
            item.id === dbId ? { ...item, store: newStore } : item
          )
        );
      } catch (error) {
        console.error('Failed to update item store:', error);
      }
      setEditingItem(null);
      return;
    }

    // Update local state immediately for responsive UI (meal-based items)
    setGroceryList(prev => {
      const updatedOldStore = prev[oldStore]?.filter(item => item.id !== editingItem.id) || [];
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

    // Persist to server - update all associated ingredient IDs
    if (editingItem.ingredientIds && editingItem.ingredientIds.length > 0) {
      try {
        await Promise.all(
          editingItem.ingredientIds.map(ingredientId =>
            MealsService.updateIngredientStore(ingredientId, newStore)
          )
        );
      } catch (error) {
        console.error('Failed to persist store change:', error);
        // Note: We don't revert the UI change since the local state is still useful
        // The next time the grocery list is regenerated, it will pull the server state
      }
    }

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

  const clearCompleted = async () => {
    if (!window.confirm('Clear all completed items?')) return;

    // Clear completed manual items from database
    try {
      await GroceryItemService.clearCompleted();
      setManualItems(prev => prev.filter(item => !item.completed));
    } catch (error) {
      console.error('Failed to clear completed manual items:', error);
    }

    // Clear completed meal-based items from local state
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