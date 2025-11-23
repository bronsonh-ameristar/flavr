import React from 'react';
import { Check, Trash2, Store, Edit2, ArrowRightLeft } from 'lucide-react';

const GroceryItem = ({
    item,
    storeName,
    onToggleComplete,
    onRemove,
    onEditStore,
    onConvertUnit
}) => {
    return (
        <div className={`grocery-item ${item.completed ? 'completed' : ''}`}>
            <button
                className="complete-btn"
                onClick={() => onToggleComplete(storeName, item.id)}
                aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
            >
                {item.completed ? <Check size={16} /> : <div className="empty-check"></div>}
            </button>

            <div className="item-content">
                <div className="item-main">
                    <span className="item-name">{item.name}</span>
                    <div className="item-quantity-group">
                        <span className="item-quantity">
                            {item.displayQuantity || `${item.quantity} ${item.unit || ''}`}
                        </span>
                        {item.unit && (
                            <button
                                className="convert-unit-btn"
                                onClick={() => onConvertUnit(storeName, item)}
                                title="Convert unit"
                            >
                                <ArrowRightLeft size={12} />
                            </button>
                        )}
                    </div>
                </div>
                {item.usedInMeals && item.usedInMeals.length > 0 && (
                    <div className="item-meals">
                        Used in: {item.usedInMeals.join(', ')}
                    </div>
                )}
                {item.originalUnits && item.originalUnits.length > 1 && (
                    <div className="item-consolidated">
                        Consolidated from: {item.originalUnits.map(u => `${u.quantity} ${u.unit}`).join(' + ')}
                    </div>
                )}
                <div className="item-footer">
                    <span className="item-category">{item.category}</span>
                    <button
                        className="change-store-btn"
                        onClick={() => onEditStore(storeName, item.id)}
                        title="Change store"
                    >
                        <Store size={12} />
                        <span>{storeName}</span>
                        <Edit2 size={12} />
                    </button>
                </div>
            </div>

            <button
                className="remove-btn"
                onClick={() => onRemove(storeName, item.id)}
                aria-label="Remove item"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};

export default GroceryItem;
