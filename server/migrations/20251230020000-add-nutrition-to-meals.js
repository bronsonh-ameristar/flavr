'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Meals', 'calories', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    });

    await queryInterface.addColumn('Meals', 'protein', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    });

    await queryInterface.addColumn('Meals', 'carbs', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    });

    await queryInterface.addColumn('Meals', 'fat', {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Meals', 'calories');
    await queryInterface.removeColumn('Meals', 'protein');
    await queryInterface.removeColumn('Meals', 'carbs');
    await queryInterface.removeColumn('Meals', 'fat');
  }
};
