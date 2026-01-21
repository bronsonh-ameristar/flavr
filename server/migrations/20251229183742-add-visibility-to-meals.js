'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add visibility column with ENUM type
    await queryInterface.addColumn('Meals', 'visibility', {
      type: Sequelize.ENUM('public', 'private'),
      allowNull: false,
      defaultValue: 'private'
    });

    // Add index for faster visibility-based queries
    await queryInterface.addIndex('Meals', ['visibility']);
  },

  async down(queryInterface, Sequelize) {
    // Remove index first
    await queryInterface.removeIndex('Meals', ['visibility']);

    // Remove column
    await queryInterface.removeColumn('Meals', 'visibility');

    // Drop the ENUM type (PostgreSQL specific)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Meals_visibility";');
  }
};
