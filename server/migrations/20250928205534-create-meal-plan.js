'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MealPlans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      mealType: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['breakfast', 'lunch', 'dinner', 'snack']]
        }
      },
      mealId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Meals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add unique constraint to prevent duplicate meal assignments
    await queryInterface.addIndex('MealPlans', {
      unique: true,
      fields: ['date', 'mealType'],
      name: 'unique_meal_plan_slot'
    });

    // Add index for better performance
    await queryInterface.addIndex('MealPlans', ['date']);
    await queryInterface.addIndex('MealPlans', ['mealId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MealPlans');
  }
};