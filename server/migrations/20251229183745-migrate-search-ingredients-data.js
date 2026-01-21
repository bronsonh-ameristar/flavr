'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get ID mappings: SearchMeal.id -> new Meal.id
    // We match by name since SearchMeals were copied with same name
    const searchMeals = await queryInterface.sequelize.query(
      'SELECT id, name FROM "SearchMeals"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const publicMeals = await queryInterface.sequelize.query(
      `SELECT id, name FROM "Meals" WHERE visibility = 'public' AND "userId" IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create ID mapping based on name matching
    const idMap = {};
    for (const sm of searchMeals) {
      const matchingMeal = publicMeals.find(m => m.name === sm.name);
      if (matchingMeal) {
        idMap[sm.id] = matchingMeal.id;
      }
    }

    // Get all SearchIngredients
    const searchIngredients = await queryInterface.sequelize.query(
      'SELECT * FROM "SearchIngredients"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    let migratedCount = 0;

    // Insert into Ingredients with converted quantity and new mealId
    for (const ing of searchIngredients) {
      const newMealId = idMap[ing.searchMealId];
      if (!newMealId) {
        console.warn(`No matching meal found for SearchIngredient ${ing.id} (searchMealId: ${ing.searchMealId})`);
        continue;
      }

      // Convert DECIMAL quantity to STRING
      // Handle null quantities gracefully - default to '1'
      const quantityStr = ing.quantity !== null ? String(ing.quantity) : '1';

      await queryInterface.sequelize.query(`
        INSERT INTO "Ingredients"
        ("name", "quantity", "unit", "notes", "category", "mealId", "createdAt", "updatedAt")
        VALUES
        (:name, :quantity, :unit, :notes, 'other', :mealId, :createdAt, :updatedAt)
      `, {
        replacements: {
          name: ing.name,
          quantity: quantityStr,
          unit: ing.unit,
          notes: ing.notes,
          mealId: newMealId,
          createdAt: ing.createdAt,
          updatedAt: ing.updatedAt
        }
      });

      migratedCount++;
    }

    console.log(`Migrated ${migratedCount} SearchIngredients to Ingredients table`);
  },

  async down(queryInterface, Sequelize) {
    // Get the IDs of public meals (migrated from SearchMeals)
    const publicMeals = await queryInterface.sequelize.query(
      `SELECT id FROM "Meals" WHERE visibility = 'public' AND "userId" IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const ids = publicMeals.map(m => m.id);
    if (ids.length > 0) {
      await queryInterface.sequelize.query(
        `DELETE FROM "Ingredients" WHERE "mealId" IN (:ids)`,
        { replacements: { ids } }
      );
      console.log(`Removed ingredients for ${ids.length} public meals`);
    }
  }
};
