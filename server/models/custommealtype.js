'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CustomMealType extends Model {
    static associate(models) {
      CustomMealType.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  CustomMealType.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Meal type name cannot be empty'
        },
        len: {
          args: [1, 50],
          msg: 'Meal type name must be between 1 and 50 characters'
        }
      }
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'CustomMealType',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'name']
      }
    ]
  });

  return CustomMealType;
};
