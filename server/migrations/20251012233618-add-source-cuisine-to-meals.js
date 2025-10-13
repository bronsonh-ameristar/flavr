'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add source column
    await queryInterface.addColumn('Meals', 'source', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });

    // Add cuisineType column
    await queryInterface.addColumn('Meals', 'cuisineType', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Add searchMealId to track which global meal this came from
    await queryInterface.addColumn('Meals', 'searchMealId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'SearchMeals',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add userId if you have user authentication
    await queryInterface.addColumn('Meals', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Add index for faster queries
    await queryInterface.addIndex('Meals', ['source']);
    await queryInterface.addIndex('Meals', ['searchMealId']);
    await queryInterface.addIndex('Meals', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('Meals', ['userId']);
    await queryInterface.removeIndex('Meals', ['searchMealId']);
    await queryInterface.removeIndex('Meals', ['source']);
    await queryInterface.removeColumn('Meals', 'userId');
    await queryInterface.removeColumn('Meals', 'searchMealId');
    await queryInterface.removeColumn('Meals', 'cuisineType');
    await queryInterface.removeColumn('Meals', 'source');
  }
};