'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Meals', 'structuredInstructions', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null,
      comment: 'Structured step-by-step instructions for meal prep planning'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Meals', 'structuredInstructions');
  }
};