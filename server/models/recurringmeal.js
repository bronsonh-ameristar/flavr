'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RecurringMeal extends Model {
    static associate(models) {
      RecurringMeal.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      RecurringMeal.belongsTo(models.Meal, {
        foreignKey: 'mealId',
        as: 'meal'
      });
    }

    // Helper to get day name
    getDayName() {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[this.dayOfWeek];
    }
  }

  RecurringMeal.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    mealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Meals',
        key: 'id'
      }
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        },
        max: {
          args: [6],
          msg: 'Day of week must be between 0 (Sunday) and 6 (Saturday)'
        }
      }
    },
    mealType: {
      type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'dessert'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['breakfast', 'lunch', 'dinner', 'snack', 'dessert']],
          msg: 'Meal type must be breakfast, lunch, dinner, snack, or dessert'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'RecurringMeal',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'dayOfWeek', 'mealType'],
        name: 'recurring_meals_user_day_type_unique'
      }
    ]
  });

  return RecurringMeal;
};
