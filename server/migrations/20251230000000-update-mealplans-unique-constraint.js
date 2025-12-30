'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove old unique constraint on (date, mealType)
    try {
      await queryInterface.removeIndex('MealPlans', ['date', 'mealType']);
    } catch (e) {
      console.log('Old index may not exist or has different name:', e.message);
      // Try alternate index name format
      try {
        await queryInterface.removeIndex('MealPlans', 'meal_plans_date_meal_type');
      } catch (e2) {
        console.log('Alternate index name also not found:', e2.message);
      }
    }

    // Add new unique constraint on (date, mealType, userId)
    await queryInterface.addIndex('MealPlans', ['date', 'mealType', 'userId'], {
      unique: true,
      name: 'meal_plans_date_meal_type_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove new unique constraint
    try {
      await queryInterface.removeIndex('MealPlans', 'meal_plans_date_meal_type_user_id');
    } catch (e) {
      console.log('New index may not exist:', e.message);
    }

    // Restore old unique constraint on (date, mealType)
    await queryInterface.addIndex('MealPlans', ['date', 'mealType'], {
      unique: true,
      name: 'meal_plans_date_meal_type'
    });
  }
};
