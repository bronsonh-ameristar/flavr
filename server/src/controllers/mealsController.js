const MealService = require('../services/mealService');

class MealsController {
  // Get all meals with ingredients
  static async getAllMeals(req, res) {
    try {
      const result = await MealService.getAllMeals(req.query);

      res.json({
        ...result,
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
      const meal = await MealService.getMealById(req.params.id);

      res.json({
        data: meal,
        success: true
      });
    } catch (error) {
      console.error('Error fetching meal:', error);

      if (error.message === 'Meal not found') {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

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
      const meal = await MealService.createMeal(mealData, ingredients);

      res.status(201).json({
        data: meal,
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
      const { ingredients, ...mealData } = req.body;
      const meal = await MealService.updateMeal(req.params.id, mealData, ingredients);

      res.json({
        data: meal,
        success: true
      });
    } catch (error) {
      console.error('Error updating meal:', error);

      if (error.message === 'Meal not found') {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

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

  // Delete meal
  static async deleteMeal(req, res) {
    try {
      await MealService.deleteMeal(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting meal:', error);

      if (error.message === 'Meal not found') {
        return res.status(404).json({
          error: 'Meal not found',
          success: false
        });
      }

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
      const hasMeal = await MealService.checkGlobalMeal(req.params.id);
      return res.status(200).json({
        hasMeal,
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
      const meal = await MealService.addGlobalMeal(req.params.id);

      res.status(201).json({
        message: 'Meal successfully added to your collection',
        data: meal,
        success: true
      });

    } catch (error) {
      console.error('Error adding global meal to personal list:', error);

      if (error.message === 'Global meal not found') {
        return res.status(404).json({
          error: 'Global meal not found',
          success: false
        });
      }

      if (error.code === 'DUPLICATE_MEAL') {
        return res.status(409).json({
          error: error.message,
          data: error.data,
          success: false
        });
      }

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