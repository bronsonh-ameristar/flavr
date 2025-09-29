'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Meal extends Model {
    static associate(models) {
      // We'll add associations later for ingredients, meal plans, etc.
      // Meal has many ingredients
      Meal.hasMany(models.Ingredient, {
        foreignKey: 'mealId',
        as: 'ingredients',
        onDelete: 'CASCADE'
      });

      // Meal has many meal plans
      Meal.hasMany(models.MealPlan, {
        foreignKey: 'mealId',
        as: 'mealPlans',
        onDelete: 'CASCADE'
      });
    }

    // Instance method to get total time
    getTotalTime() {
      return (this.prepTime || 0) + (this.cookTime || 0);
    }

    // Instance method to format for API response
    toJSON() {
      const values = { ...this.get() };
      values.totalTime = this.getTotalTime();
      return values;
    }
  }

  Meal.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Name must be between 1 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prepTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Prep time cannot be negative'
        },
        isInt: {
          msg: 'Prep time must be a whole number'
        }
      }
    },
    cookTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Cook time cannot be negative'
        },
        isInt: {
          msg: 'Cook time must be a whole number'
        }
      }
    },
    servings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: 1,
          msg: 'Servings must be at least 1'
        }
      }
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isIn: {
          args: [['easy', 'medium', 'hard']],
          msg: 'Difficulty must be easy, medium, or hard'
        }
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'dinner',
      validate: {
        isIn: {
          args: [['breakfast', 'lunch', 'dinner', 'snack', 'dessert']],
          msg: 'Category must be breakfast, lunch, dinner, snack, or dessert'
        }
      }
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Image URL must be a valid URL'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Meal',
  });

  return Meal;
};