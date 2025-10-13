'use strict';
const { Meal, Ingredient, SearchMeal, SearchIngredient } = require('../../models');

class NewMealService {
  /**
   * Copy a SearchMeal to a user's personal Meals table
   * @param {number} searchMealId - ID of the SearchMeal to copy
   * @param {number} userId - ID of the user (optional, if you have auth)
   * @returns {Promise<Meal>} The newly created personal meal
   */
  static async copySearchMealToPersonal(searchMealId, userId = null) {
    // Fetch the SearchMeal with its ingredients
    const searchMeal = await SearchMeal.findByPk(searchMealId, {
      include: [{
        model: SearchIngredient,
        as: 'ingredients'
      }]
    });

    if (!searchMeal) {
      throw new Error('SearchMeal not found');
    }

    // Check if user already has this meal (to avoid duplicates)
    if (userId) {
      const existingMeal = await Meal.findOne({
        where: {
          searchMealId: searchMealId,
          userId: userId
        }
      });

      if (existingMeal) {
        return existingMeal; // Return existing meal instead of creating duplicate
      }
    }

    // Create the personal meal
    const newMeal = await Meal.create({
      name: searchMeal.name,
      description: searchMeal.description,
      prepTime: searchMeal.prepTime,
      cookTime: searchMeal.cookTime,
      servings: searchMeal.servings,
      difficulty: searchMeal.difficulty,
      category: searchMeal.category,
      instructions: searchMeal.instructions,
      imageUrl: searchMeal.imageUrl,
      source: 'global', // Mark as coming from global
      cuisineType: searchMeal.cuisineType,
      searchMealId: searchMealId, // Track the original
      userId: userId
    });

    // Copy ingredients
    if (searchMeal.ingredients && searchMeal.ingredients.length > 0) {
      const ingredientsData = searchMeal.ingredients.map(ingredient => ({
        mealId: newMeal.id,
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        notes: ingredient.notes
      }));

      await Ingredient.bulkCreate(ingredientsData);
    }

    // Return the meal with ingredients
    return await Meal.findByPk(newMeal.id, {
      include: [{
        model: Ingredient,
        as: 'ingredients'
      }]
    });
  }

  /**
   * Check if a user already has a specific SearchMeal in their personal list
   * @param {number} searchMealId 
   * @param {number} userId 
   * @returns {Promise<boolean>}
   */
  static async hasSearchMealInPersonalList(searchMealId, userId) {
    const count = await Meal.count({
      where: {
        searchMealId: searchMealId,
        userId: userId
      }
    });
    return count > 0;
  }

  /**
   * Get all personal meals for a user, grouped by source
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  static async getUserMealsBySource(userId) {
    const meals = await Meal.findAll({
      where: { userId: userId },
      include: [{
        model: Ingredient,
        as: 'ingredients'
      }],
      order: [['createdAt', 'DESC']]
    });

    return {
      global: meals.filter(m => m.source === 'global'),
      local: meals.filter(m => m.source === 'local')
    };
  }
}

module.exports = NewMealService;