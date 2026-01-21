'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create Users table
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false
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

    // Add indexes for faster lookups
    await queryInterface.addIndex('Users', ['username']);
    await queryInterface.addIndex('Users', ['email']);

    // Add userId column to MealPlans table
    await queryInterface.addColumn('MealPlans', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially nullable for existing data
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add index on userId for MealPlans
    await queryInterface.addIndex('MealPlans', ['userId']);

    // Add foreign key constraint to Meals.userId
    // First, we need to handle this carefully since userId column already exists
    // We'll add the constraint without modifying the column
    try {
      await queryInterface.addConstraint('Meals', {
        fields: ['userId'],
        type: 'foreign key',
        name: 'fk_meals_user',
        references: {
          table: 'Users',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    } catch (e) {
      console.log('Meals userId constraint may already exist or column needs adjustment');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraint from Meals
    try {
      await queryInterface.removeConstraint('Meals', 'fk_meals_user');
    } catch (e) {
      console.log('Constraint fk_meals_user may not exist');
    }

    // Remove userId column from MealPlans
    await queryInterface.removeIndex('MealPlans', ['userId']);
    await queryInterface.removeColumn('MealPlans', 'userId');

    // Drop Users table
    await queryInterface.removeIndex('Users', ['email']);
    await queryInterface.removeIndex('Users', ['username']);
    await queryInterface.dropTable('Users');
  }
};
