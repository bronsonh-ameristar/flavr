'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GroceryItem extends Model {
    static associate(models) {
      GroceryItem.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  GroceryItem.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Item name cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Item name must be between 1 and 255 characters'
        }
      }
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1'
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'other',
      validate: {
        isIn: {
          args: [['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other']],
          msg: 'Category must be one of: produce, meat, dairy, pantry, spices, frozen, other'
        }
      }
    },
    store: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Unassigned'
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'User ID is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'GroceryItem',
  });

  return GroceryItem;
};
