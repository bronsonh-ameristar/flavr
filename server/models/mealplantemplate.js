'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MealPlanTemplate extends Model {
    static associate(models) {
      MealPlanTemplate.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      MealPlanTemplate.hasMany(models.MealPlanTemplateItem, {
        foreignKey: 'templateId',
        as: 'items',
        onDelete: 'CASCADE'
      });
    }
  }

  MealPlanTemplate.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Template name cannot be empty'
        },
        len: {
          args: [1, 100],
          msg: 'Template name must be between 1 and 100 characters'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'MealPlanTemplate'
  });

  return MealPlanTemplate;
};
