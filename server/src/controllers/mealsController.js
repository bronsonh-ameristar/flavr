// At the top of server/src/controllers/mealsController.js
const { Meal } = require('../../models');
const { Op } = require('sequelize'); // Add this line for search functionality

class MealsController {
  // Get all meals
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

  // Get single meal
  static async getMealById(req, res) {
    try {
      const { id } = req.params;
      const meal = await Meal.findByPk(id);
      
      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }
      
      res.json(meal);
    } catch (error) {
      console.error('Error fetching meal:', error);
      res.status(500).json({ error: 'Failed to fetch meal' });
    }
  }

  // Create new meal
  // In the createMeal method, add data parsing:
    static async createMeal(req, res) {
        try {
            const mealData = { ...req.body };
            
            // Parse numeric fields to ensure they're integers
            if (mealData.prepTime !== undefined) {
            mealData.prepTime = parseInt(mealData.prepTime) || null;
            }
            if (mealData.cookTime !== undefined) {
            mealData.cookTime = parseInt(mealData.cookTime) || null;
            }
            if (mealData.servings !== undefined) {
            mealData.servings = parseInt(mealData.servings) || 1;
            }
            
            const meal = await Meal.create(mealData);
            res.status(201).json(meal);
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

  // Update meal
  static async updateMeal(req, res) {
    try {
      const { id } = req.params;
      const mealData = req.body;
      
      const [updatedCount, updatedMeals] = await Meal.update(mealData, {
        where: { id },
        returning: true
      });
      
      if (updatedCount === 0) {
        return res.status(404).json({ error: 'Meal not found' });
      }
      
      res.json(updatedMeals[0]);
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

  // Delete meal
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