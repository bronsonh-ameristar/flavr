const MealService = require('../services/mealService');

class MealsController {
  // Get all private meals with ingredients (filtered by user)
  static async getAllMeals(req, res) {
    try {
      const result = await MealService.getAllMeals({
        ...req.query,
        userId: req.userId
      });

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

  // Get single meal with ingredients (with ownership check)
  static async getMealById(req, res) {
    try {
      const meal = await MealService.getMealById(req.params.id, req.userId);

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

  // Create new meal with ingredients (assigned to current user)
  static async createMeal(req, res) {
    try {
      const { ingredients, ...mealData } = req.body;
      const meal = await MealService.createMeal(mealData, ingredients, req.userId);

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

  // Update meal (with ownership check)
  static async updateMeal(req, res) {
    try {
      const { ingredients, ...mealData } = req.body;
      const meal = await MealService.updateMeal(req.params.id, mealData, ingredients, req.userId);

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

  // Delete meal (with ownership check)
  static async deleteMeal(req, res) {
    try {
      await MealService.deleteMeal(req.params.id, req.userId);
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

  // PUBLIC MEAL ENDPOINTS

  // Get all public meals with filters
  static async getPublicMeals(req, res) {
    try {
      const result = await MealService.getPublicMeals(req.query);

      res.json({
        ...result,
        success: true
      });
    } catch (error) {
      console.error('Error fetching public meals:', error);
      res.status(500).json({
        error: 'Failed to fetch public meals',
        message: error.message,
        success: false
      });
    }
  }

  // Get top N public meals
  static async getTopPublicMeals(req, res) {
    try {
      const { limit = 10 } = req.query;
      const result = await MealService.getTopPublicMeals(limit);

      res.json({
        ...result,
        success: true
      });
    } catch (error) {
      console.error('Error fetching top public meals:', error);
      res.status(500).json({
        error: 'Failed to fetch top public meals',
        message: error.message,
        success: false
      });
    }
  }

  // Search public meals with filters
  static async searchPublicMeals(req, res) {
    try {
      const result = await MealService.getPublicMeals(req.query);

      res.json({
        ...result,
        success: true
      });
    } catch (error) {
      console.error('Error searching public meals:', error);
      res.status(500).json({
        error: 'Failed to search public meals',
        message: error.message,
        success: false
      });
    }
  }

  // Get single public meal by ID
  static async getPublicMealById(req, res) {
    try {
      const meal = await MealService.getPublicMealById(req.params.id);

      res.json({
        data: meal,
        success: true
      });
    } catch (error) {
      console.error('Error fetching public meal:', error);

      if (error.message === 'Public meal not found') {
        return res.status(404).json({
          error: 'Public meal not found',
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to fetch public meal',
        message: error.message,
        success: false
      });
    }
  }

  // Check if public meal is already in user's private collection
  static async checkPublicMeal(req, res) {
    try {
      const hasMeal = await MealService.checkPublicMeal(req.params.id, req.userId);
      return res.status(200).json({
        hasMeal,
        success: true
      });
    } catch (error) {
      console.error('Error checking public meal:', error);
      res.status(500).json({
        error: 'Failed to check for meal',
        message: error.message,
        success: false
      });
    }
  }

  // Add public meal to user's private collection
  static async addPublicMeal(req, res) {
    try {
      const meal = await MealService.addPublicMeal(req.params.id, req.userId);

      res.status(201).json({
        message: 'Meal successfully added to your collection',
        data: meal,
        success: true
      });

    } catch (error) {
      console.error('Error adding public meal to personal list:', error);

      if (error.message === 'Public meal not found') {
        return res.status(404).json({
          error: 'Public meal not found',
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
        error: 'Failed to add public meal to personal list',
        message: error.message,
        success: false
      });
    }
  }

  // Update ingredient store assignment
  static async updateIngredientStore(req, res) {
    try {
      const { ingredientId } = req.params;
      const { store } = req.body;
      const userId = req.userId;

      if (!store) {
        return res.status(400).json({
          error: 'Store name is required',
          success: false
        });
      }

      const ingredient = await MealService.updateIngredientStore(ingredientId, store, userId);

      res.json({
        data: ingredient,
        success: true
      });
    } catch (error) {
      console.error('Error updating ingredient store:', error);

      if (error.message === 'Ingredient not found' || error.message === 'Not authorized') {
        return res.status(404).json({
          error: error.message,
          success: false
        });
      }

      res.status(500).json({
        error: 'Failed to update ingredient store',
        message: error.message,
        success: false
      });
    }
  }
}

module.exports = MealsController;
