import React from 'react';
import GroceryItem from './GroceryItem';

const GroceryStoreSection = ({
    storeName,
    items,
    onToggleComplete,
    onRemove,
    onEditStore,
    onConvertUnit
}) => {
    const storeCompleted = items.filter(item => item.completed).length;
    const storeTotal = items.length;
    const progressPercentage = storeTotal > 0 ? (storeCompleted / storeTotal) * 100 : 0;

    return (
        <div className="store-section">
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
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            <div className="items-list">
                {items.map(item => (
                    <GroceryItem
                        key={item.id}
                        item={item}
                        storeName={storeName}
                        onToggleComplete={onToggleComplete}
                        onRemove={onRemove}
                        onEditStore={onEditStore}
                        onConvertUnit={onConvertUnit}
                    />
                ))}
            </div>
        </div>
    );
};

export default GroceryStoreSection;
