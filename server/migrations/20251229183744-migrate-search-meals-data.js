'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get all SearchMeals
    const searchMeals = await queryInterface.sequelize.query(
      'SELECT * FROM "SearchMeals"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Insert each SearchMeal into Meals with visibility='public'
    for (const meal of searchMeals) {
      await queryInterface.sequelize.query(`
        INSERT INTO "Meals"
        ("name", "description", "prepTime", "cookTime", "servings",
         "difficulty", "category", "instructions", "imageUrl",
         "cuisineType", "visibility", "userId", "source", "createdAt", "updatedAt")
        VALUES
        (:name, :description, :prepTime, :cookTime, :servings,
         :difficulty, :category, :instructions, :imageUrl,
         :cuisineType, 'public', NULL, 'global', :createdAt, :updatedAt)
      `, {
        replacements: {
          name: meal.name,
          description: meal.description,
          prepTime: meal.prepTime,
          cookTime: meal.cookTime,
          servings: meal.servings,
          difficulty: meal.difficulty,
          category: meal.category,
          instructions: meal.instructions,
          imageUrl: meal.imageUrl,
          cuisineType: meal.cuisineType,
          createdAt: meal.createdAt,
          updatedAt: meal.updatedAt
        }
      });
    }

    console.log(`Migrated ${searchMeals.length} SearchMeals to Meals table with visibility='public'`);
  },

  async down(queryInterface, Sequelize) {
    // Delete migrated public meals (those without userId)
    const result = await queryInterface.sequelize.query(`
      DELETE FROM "Meals" WHERE visibility = 'public' AND "userId" IS NULL
    `);

    console.log('Removed migrated public meals from Meals table');
  }
};
