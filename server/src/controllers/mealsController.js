const { Meal, Ingredient } = require('../../models');
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
        meals: meals.rows,
        totalCount: meals.count,
        hasMore: (parseInt(offset) + parseInt(limit)) < meals.count
      });
    } catch (error) {
      console.error('Error fetching meals:', error);
      res.status(500).json({ error: 'Failed to fetch meals' });
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
        return res.status(404).json({ error: 'Meal not found' });
      }
      
      res.json(meal);
    } catch (error) {
      console.error('Error fetching meal:', error);
      res.status(500).json({ error: 'Failed to fetch meal' });
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
      
      res.status(201).json(completeMeal);
    } catch (error) {
      console.error('Error creating meal:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({ error: 'Failed to create meal' });
    }
  }

  // Update meal (existing methods remain the same)
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
        return res.status(404).json({ error: 'Meal not found' });
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
      
      res.json(updatedMeal);
    } catch (error) {
      console.error('Error updating meal:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({ error: 'Failed to update meal' });
    }
  }

  // Delete meal (cascade will handle ingredients)
  static async deleteMeal(req, res) {
    try {
      const { id } = req.params;
      const deletedCount = await Meal.destroy({ where: { id } });
      
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Meal not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting meal:', error);
      res.status(500).json({ error: 'Failed to delete meal' });
    }
  }
}

module.exports = MealsController;