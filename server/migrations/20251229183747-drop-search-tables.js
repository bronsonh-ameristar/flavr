'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop SearchIngredients first (has foreign key to SearchMeals)
    await queryInterface.dropTable('SearchIngredients');
    console.log('Dropped SearchIngredients table');

    // Then drop SearchMeals
    await queryInterface.dropTable('SearchMeals');
    console.log('Dropped SearchMeals table');
  },

  async down(queryInterface, Sequelize) {
    // Recreate SearchMeals table
    await queryInterface.createTable('SearchMeals', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      prepTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      cookTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      servings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      difficulty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'dinner'
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'global'
      },
      cuisineType: {
        type: Sequelize.STRING,
        allowNull: true
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

    // Recreate SearchIngredients table
    await queryInterface.createTable('SearchIngredients', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      searchMealId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SearchMeals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('SearchIngredients', ['searchMealId']);

    console.log('Restored SearchMeals and SearchIngredients tables');
  }
};
