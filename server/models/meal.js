'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Meal extends Model {
    static associate(models) {
      Meal.hasMany(models.Ingredient, {
        foreignKey: 'mealId',
        as: 'ingredients',
        onDelete: 'CASCADE'
      });

      Meal.hasMany(models.MealPlan, {
        foreignKey: 'mealId',
        as: 'mealPlans',
        onDelete: 'CASCADE'
      });

      Meal.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Meal.hasMany(models.RecurringMeal, {
        foreignKey: 'mealId',
        as: 'recurringMeals',
        onDelete: 'CASCADE'
      });

      Meal.hasMany(models.MealPlanTemplateItem, {
        foreignKey: 'mealId',
        as: 'templateItems',
        onDelete: 'CASCADE'
      });
    }

    getTotalTime() {
      return (this.prepTime || 0) + (this.cookTime || 0);
    }

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
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'private',
      validate: {
        isIn: {
          args: [['public', 'private']],
          msg: 'Visibility must be public or private'
        }
      }
    },
    cuisineType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'If you have user authentication, track which user owns this meal'
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Calories cannot be negative'
        },
        isInt: {
          msg: 'Calories must be a whole number'
        }
      }
    },
    protein: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Protein cannot be negative'
        },
        isInt: {
          msg: 'Protein must be a whole number'
        }
      }
    },
    carbs: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Carbs cannot be negative'
        },
        isInt: {
          msg: 'Carbs must be a whole number'
        }
      }
    },
    fat: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Fat cannot be negative'
        },
        isInt: {
          msg: 'Fat must be a whole number'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Meal',
  });

  return Meal;
};
