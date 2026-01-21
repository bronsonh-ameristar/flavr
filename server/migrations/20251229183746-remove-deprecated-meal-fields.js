'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove indexes first
    try {
      await queryInterface.removeIndex('Meals', ['source']);
    } catch (e) {
      console.log('Index on source may not exist, continuing...');
    }

    try {
      await queryInterface.removeIndex('Meals', ['searchMealId']);
    } catch (e) {
      console.log('Index on searchMealId may not exist, continuing...');
    }

    // Remove columns
    await queryInterface.removeColumn('Meals', 'source');
    await queryInterface.removeColumn('Meals', 'searchMealId');

    console.log('Removed deprecated fields: source, searchMealId from Meals table');
  },

  async down(queryInterface, Sequelize) {
    // Re-add columns
    await queryInterface.addColumn('Meals', 'source', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'local'
    });

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

    // Re-add indexes
    await queryInterface.addIndex('Meals', ['source']);
    await queryInterface.addIndex('Meals', ['searchMealId']);

    console.log('Restored deprecated fields: source, searchMealId to Meals table');
  }
};
