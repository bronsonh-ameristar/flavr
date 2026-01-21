'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MealPlan extends Model {
    static associate(models) {
      // MealPlan belongs to Meal
      MealPlan.belongsTo(models.Meal, {
        foreignKey: 'mealId',
        as: 'meal'
      });

      // MealPlan belongs to User
      MealPlan.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    // Helper method to format date for frontend
    // Note: DATEONLY fields in Sequelize are returned as strings in YYYY-MM-DD format
    getFormattedDate() {
      // If date is already a string (DATEONLY), return as-is
      if (typeof this.date === 'string') {
        return this.date;
      }
      // If it's a Date object, format it in local timezone
      const year = this.date.getFullYear();
      const month = String(this.date.getMonth() + 1).padStart(2, '0');
      const day = String(this.date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // Helper method to get meal plan key for frontend
    getPlanKey() {
      return `${this.getFormattedDate()}-${this.mealType}`;
    }
  }

  MealPlan.init({
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Date is required'
        },
        isDate: {
          msg: 'Date must be a valid date'
        }
      }
    },
    mealType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Meal type is required'
        },
        isIn: {
          args: [['breakfast', 'lunch', 'dinner', 'snack']],
          msg: 'Meal type must be breakfast, lunch, dinner, or snack'
        }
      }
    },
    mealId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Meal ID is required'
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MealPlan',
    indexes: [
      {
        unique: true,
        fields: ['date', 'mealType', 'userId']
      }
    ]
  });

  return MealPlan;
};