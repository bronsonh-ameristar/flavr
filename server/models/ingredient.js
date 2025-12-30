'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    static associate(models) {
      Ingredient.belongsTo(models.Meal, {
        foreignKey: 'mealId',
        as: 'meal'
      });
    }

    getDisplayText() {
      return `${this.quantity}${this.unit ? ' ' + this.unit : ''} ${this.name}`;
    }
  }

  Ingredient.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Ingredient name cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Ingredient name must be between 1 and 255 characters'
        }
      }
    },
    quantity: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Quantity cannot be empty'
        }
      }
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [['produce', 'meat', 'dairy', 'pantry', 'spices', 'frozen', 'other']],
          msg: 'Category must be one of: produce, meat, dairy, pantry, spices, frozen, other'
        }
      }
    },
    store: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    mealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Meal ID is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Ingredient',
  });

  return Ingredient;
};