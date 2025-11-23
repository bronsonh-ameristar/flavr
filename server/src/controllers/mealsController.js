const { Meal, Ingredient, SearchMeal, SearchIngredient } = require('../../models');
const { Op } = require('sequelize');

class MealsController {
  // Get all meals with ingredients
  static async getAllMeals(req, res) {
    try {
      const { category, search, limit = 50, offset = 0 } = req.query;

      const whereClause = {};

      if (category && category !== 'all') {
        whereClause.category = category;
      }

      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const meals = await Meal.findAndCountAll({
        where: whereClause,
        include: [{
          model: Ingredient,
          as: 'ingredients',
          attributes: ['id', 'name', 'quantity', 'unit', 'category']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        data: meals.rows,              // Changed from 'meals' to 'data'
        totalCount: meals.count,
        hasMore: (parseInt(offset) + parseInt(limit)) < meals.count,
        success: true
      });
    } catch (error) {
      console.error('Error fetching meals:', error);
      res.status(500).json({
        error: 'Failed to fetch meals',
        message: error.message,
        success: false
      });
    }
  }

  // Get single meal with ingredients
  static async getMealById(req, res) {
    try {
      const { id } = req.params;
      const meal = await Meal.findByPk(id, {
        include: [{
          model: Ingredient,
          as: 'ingredients',
          attributes: ['id', 'name', 'quantity', 'unit', 'category']
        }]
      });

      if (!meal) {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

      res.json({
        data: meal,                    // Wrapped in 'data' for consistency
        success: true
      });
    } catch (error) {
      console.error('Error fetching meal:', error);
      res.status(500).json({
        error: 'Failed to fetch meal',
        message: error.message,
        success: false
      });
    }
  }

  // Create new meal with ingredients
  static async createMeal(req, res) {
    try {
      const { ingredients, ...mealData } = req.body;

      // Parse numeric fields
      if (mealData.prepTime !== undefined) {
        mealData.prepTime = parseInt(mealData.prepTime) || null;
      }
      if (mealData.cookTime !== undefined) {
        mealData.cookTime = parseInt(mealData.cookTime) || null;
      }
      if (mealData.servings !== undefined) {
        mealData.servings = parseInt(mealData.servings) || 1;
      }

      // Create meal
      const meal = await Meal.create(mealData);

      // Create ingredients if provided
      if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
        const ingredientPromises = ingredients.map(ingredient =>
          Ingredient.create({
            ...ingredient,
            mealId: meal.id
          })
        );
        await Promise.all(ingredientPromises);
      }

      // Fetch the complete meal with ingredients
      const completeMeal = await Meal.findByPk(meal.id, {
        include: [{
          model: Ingredient,
          as: 'ingredients'
        }]
      });

      res.status(201).json({
        data: completeMeal,            // Wrapped in 'data' for consistency
        success: true
      });
    } catch (error) {
      console.error('Error creating meal:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to create meal',
        message: error.message,
        success: false
      });
    }
  }

  // Update meal
  static async updateMeal(req, res) {
    try {
      const { id } = req.params;
      const { ingredients, ...mealData } = req.body;

      // Parse numeric fields
      if (mealData.prepTime !== undefined) {
        mealData.prepTime = parseInt(mealData.prepTime) || null;
      }
      if (mealData.cookTime !== undefined) {
        mealData.cookTime = parseInt(mealData.cookTime) || null;
      }
      if (mealData.servings !== undefined) {
        mealData.servings = parseInt(mealData.servings) || 1;
      }

      const [updatedCount] = await Meal.update(mealData, {
        where: { id }
      });

      if (updatedCount === 0) {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

      // Update ingredients if provided
      if (ingredients && Array.isArray(ingredients)) {
        // Delete existing ingredients
        await Ingredient.destroy({ where: { mealId: id } });

        // Create new ingredients
        if (ingredients.length > 0) {
          const ingredientPromises = ingredients.map(ingredient =>
            Ingredient.create({
              ...ingredient,
              mealId: id
            })
          );
          await Promise.all(ingredientPromises);
        }
      }

      // Fetch updated meal with ingredients
      const updatedMeal = await Meal.findByPk(id, {
        include: [{
          model: Ingredient,
          as: 'ingredients'
        }]
      });

      res.json({
        data: updatedMeal,             // Wrapped in 'data' for consistency
        success: true
      });
    } catch (error) {
      console.error('Error updating meal:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to update meal',
        message: error.message,
        success: false
      });
    }
  }

  // Delete meal (cascade will handle ingredients)
  static async deleteMeal(req, res) {
    try {
      const { id } = req.params;
      const deletedCount = await Meal.destroy({ where: { id } });

      if (deletedCount === 0) {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting meal:', error);
      res.status(500).json({
        error: 'Failed to delete meal',
        message: error.message,
        success: false
      });
    }
  }

  // Check if meal is already in personal
  static async checkGlobalMeal(req, res) {
    try {
      const { id } = req.params;
      const numPresent = await Meal.findAndCountAll({ where: { id } });
      return res.status(200).json({
        hasMeal: (numPresent.count > 0),  // Fixed: was checking numPresent > 0
        success: true
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to check for meal',
        message: error.message,
        success: false
      });
    }
  }

  // add global meal to local list
  static async addGlobalMeal(req, res) {
    try {
      const { id } = req.params;

      // Find the global meal with its ingredients
      const globalMeal = await SearchMeal.findByPk(id, {
        include: [{
          model: SearchIngredient,
          as: 'ingredients'
        }]
      });

      if (!globalMeal) {
        return res.status(404).json({
          error: 'Global meal not found',
          success: false
        });
      }

      // Check if meal already exists in personal collection
      const existingMeal = await Meal.findOne({
        where: {
          name: globalMeal.name,
          description: globalMeal.description
        }
      });

      if (existingMeal) {
        return res.status(409).json({
          error: 'Meal already exists in your collection',
          data: { mealId: existingMeal.id },
          success: false
        });
      }

      // Create the meal in the personal collection
      const mealData = {
        name: globalMeal.name,
        description: globalMeal.description,
        prepTime: globalMeal.prepTime,
        cookTime: globalMeal.cookTime,
        servings: globalMeal.servings,
        difficulty: globalMeal.difficulty,
        category: globalMeal.category,
        instructions: globalMeal.instructions,
        imageUrl: globalMeal.imageUrl,
        cuisineType: globalMeal.cuisineType
      };

      const newMeal = await Meal.create(mealData);

      // Copy ingredients to the personal collection
      if (globalMeal.ingredients && globalMeal.ingredients.length > 0) {
        const ingredientPromises = globalMeal.ingredients.map(ingredient => {
          // Append notes to name if present, as Ingredient model doesn't have notes field
          // and category is an enum
          const nameWithNotes = ingredient.notes
            ? `${ingredient.name} (${ingredient.notes})`
            : ingredient.name;

          return Ingredient.create({
            name: nameWithNotes,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: 'other', // Default to 'other' as we can't reliably map notes to category enum
            mealId: newMeal.id
          });
        });
        await Promise.all(ingredientPromises);
      }

      // Fetch the complete meal with ingredients
      const completeMeal = await Meal.findByPk(newMeal.id, {
        include: [{
          model: Ingredient,
          as: 'ingredients'
        }]
      });

      res.status(201).json({
        message: 'Meal successfully added to your collection',
        data: completeMeal,              // Changed from 'meal' to 'data'
        success: true
      });

    } catch (error) {
      console.error('Error adding global meal to personal list:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message),
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to add global meal to personal list',
        message: error.message,
        success: false
      });
    }
  }
}

module.exports = MealsController;