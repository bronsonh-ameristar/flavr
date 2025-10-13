'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SearchIngredient extends Model {
    static associate(models) {
      SearchIngredient.belongsTo(models.SearchMeal, {
        foreignKey: 'searchMealId',
        as: 'searchMeal',
        onDelete: 'CASCADE'
      });
    }
  }

  SearchIngredient.init({
    searchMealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SearchMeals',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Ingredient name cannot be empty' }
      }
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SearchIngredient',
    tableName: 'SearchIngredients'
  });

  return SearchIngredient;
};