const { MealPlan, Meal, Ingredient } = require('../../models');
const { Op } = require('sequelize');

class MealPlansController {
  // Get meal plans for a date range (typically a week) - filtered by user
  static async getMealPlans(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start date and end date are required'
        });
      }

      const whereClause = {
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      // Filter by user if authenticated
      if (userId) {
        whereClause.userId = userId;
      }

      const mealPlans = await MealPlan.findAll({
        where: whereClause,
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['id', 'name', 'prepTime', 'cookTime', 'servings', 'category', 'difficulty', 'imageUrl']
        }],
        order: [['date', 'ASC'], ['mealType', 'ASC']]
      });

      // Format response for frontend
      const formattedPlans = {};
      mealPlans.forEach(plan => {
        const key = `${plan.date}-${plan.mealType}`;
        formattedPlans[key] = {
          id: plan.id,
          date: plan.date,
          mealType: plan.mealType,
          meal: plan.meal
        };
      });

      res.json({
        mealPlans: formattedPlans,
        count: mealPlans.length
      });
    } catch (error) {
      console.error('Error fetching meal plans:', error);
      res.status(500).json({ error: 'Failed to fetch meal plans' });
    }
  }

  // Add meal to meal plan - assigned to current user
  static async addMealToPlan(req, res) {
    try {
      const { date, mealType, mealId } = req.body;
      const userId = req.userId;

      if (!date || !mealType || !mealId) {
        return res.status(400).json({
          error: 'Date, meal type, and meal ID are required'
        });
      }

      // Check if meal exists and user has access to it
      const meal = await Meal.findByPk(mealId);
      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      // Only allow adding public meals or user's own private meals
      if (meal.visibility === 'private' && meal.userId !== userId) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      // Check if a meal plan already exists for this date/mealType/user
      const existingPlan = await MealPlan.findOne({
        where: {
          date,
          mealType,
          userId
        }
      });

      let mealPlan;
      let created = false;

      if (existingPlan) {
        // Update existing plan
        await existingPlan.update({ mealId });
        mealPlan = existingPlan;
      } else {
        // Create new plan
        mealPlan = await MealPlan.create({
          date,
          mealType,
          mealId,
          userId
        });
        created = true;
      }

      // Fetch the complete meal plan with meal details
      const completeMealPlan = await MealPlan.findByPk(mealPlan.id, {
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['id', 'name', 'prepTime', 'cookTime', 'servings', 'category', 'difficulty', 'imageUrl']
        }]
      });

      res.status(created ? 201 : 200).json({
        mealPlan: completeMealPlan,
        created
      });
    } catch (error) {
      console.error('Error adding meal to plan:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        });
      }

      res.status(500).json({ error: 'Failed to add meal to plan' });
    }
  }

  // Remove meal from meal plan - only for current user
  static async removeMealFromPlan(req, res) {
    try {
      const { date, mealType } = req.params;
      const userId = req.userId;

      const whereClause = { date, mealType };
      if (userId) {
        whereClause.userId = userId;
      }

      const deletedCount = await MealPlan.destroy({
        where: whereClause
      });

      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Meal plan not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error removing meal from plan:', error);
      res.status(500).json({ error: 'Failed to remove meal from plan' });
    }
  }

  // Generate grocery list - filtered by user
  static async generateGroceryList(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start date and end date are required'
        });
      }

      const whereClause = {
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const mealPlans = await MealPlan.findAll({
        where: whereClause,
        include: [{
          model: Meal,
          as: 'meal',
          include: [{
            model: Ingredient,
            as: 'ingredients'
          }]
        }]
      });

      // Consolidate ingredients
      const consolidatedIngredients = {};

      mealPlans.forEach(plan => {
        if (plan.meal && plan.meal.ingredients) {
          plan.meal.ingredients.forEach(ingredient => {
            const key = `${ingredient.name}-${ingredient.unit || 'unit'}`;

            if (consolidatedIngredients[key]) {
              const existingQty = parseFloat(consolidatedIngredients[key].quantity) || 0;
              const newQty = parseFloat(ingredient.quantity) || 0;
              consolidatedIngredients[key].quantity = (existingQty + newQty).toString();

              if (!consolidatedIngredients[key].usedInMeals.includes(plan.meal.name)) {
                consolidatedIngredients[key].usedInMeals.push(plan.meal.name);
              }

              // Keep the first non-null store
              if (!consolidatedIngredients[key].store && ingredient.store) {
                consolidatedIngredients[key].store = ingredient.store;
              }
            } else {
              consolidatedIngredients[key] = {
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                category: ingredient.category,
                store: ingredient.store || 'Unassigned',
                usedInMeals: [plan.meal.name]
              };
            }
          });
        }
      });

      // Group by store first, then by category within each store
      const groceryList = {};
      Object.values(consolidatedIngredients).forEach(ingredient => {
        const store = ingredient.store || 'Unassigned';
        if (!groceryList[store]) {
          groceryList[store] = {};
        }

        const category = ingredient.category || 'other';
        if (!groceryList[store][category]) {
          groceryList[store][category] = [];
        }

        groceryList[store][category].push(ingredient);
      });

      res.json({
        groceryList,
        totalItems: Object.keys(consolidatedIngredients).length,
        dateRange: { startDate, endDate }
      });
    } catch (error) {
      console.error('Error generating grocery list:', error);
      res.status(500).json({ error: 'Failed to generate grocery list' });
    }
  }

  // Get meal plan statistics - filtered by user
  static async getMealPlanStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.userId;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Start date and end date are required'
        });
      }

      const whereClause = {
        date: {
          [Op.between]: [startDate, endDate]
        }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const mealPlans = await MealPlan.findAll({
        where: whereClause,
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['prepTime', 'cookTime', 'servings', 'category', 'difficulty']
        }]
      });

      const stats = {
        totalMeals: mealPlans.length,
        totalCookTime: 0,
        totalPrepTime: 0,
        averageServings: 0,
        categoryCounts: {},
        difficultyCounts: {}
      };

      let totalServings = 0;

      mealPlans.forEach(plan => {
        if (plan.meal) {
          stats.totalCookTime += plan.meal.cookTime || 0;
          stats.totalPrepTime += plan.meal.prepTime || 0;
          totalServings += plan.meal.servings || 0;

          // Count categories
          const category = plan.meal.category || 'other';
          stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;

          // Count difficulties
          const difficulty = plan.meal.difficulty || 'unknown';
          stats.difficultyCounts[difficulty] = (stats.difficultyCounts[difficulty] || 0) + 1;
        }
      });

      stats.averageServings = stats.totalMeals > 0 ? (totalServings / stats.totalMeals).toFixed(1) : 0;
      stats.totalTime = stats.totalCookTime + stats.totalPrepTime;

      res.json(stats);
    } catch (error) {
      console.error('Error fetching meal plan stats:', error);
      res.status(500).json({ error: 'Failed to fetch meal plan statistics' });
    }
  }
}

module.exports = MealPlansController;
