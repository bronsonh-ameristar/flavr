'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Meal, {
        foreignKey: 'userId',
        as: 'meals',
        onDelete: 'CASCADE'
      });

      User.hasMany(models.MealPlan, {
        foreignKey: 'userId',
        as: 'mealPlans',
        onDelete: 'CASCADE'
      });
    }

    // Instance method to check password
    async validatePassword(password) {
      return bcrypt.compare(password, this.passwordHash);
    }

    // Remove password from JSON output
    toJSON() {
      const values = { ...this.get() };
      delete values.passwordHash;
      return values;
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        msg: 'Username already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Username cannot be empty'
        },
        len: {
          args: [3, 50],
          msg: 'Username must be between 3 and 50 characters'
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: 'Username can only contain letters, numbers, and underscores'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email already registered'
      },
      validate: {
        notEmpty: {
          msg: 'Email cannot be empty'
        },
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('passwordHash')) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
        }
      }
    }
  });

  return User;
};
