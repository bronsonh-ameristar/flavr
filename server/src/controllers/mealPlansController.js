const { MealPlan, Meal, Ingredient, MealPlanTemplate, MealPlanTemplateItem } = require('../../models');
const { Op } = require('sequelize');
const PrepPlanService = require('../services/prepPlanService');

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
          include: [{
            model: Ingredient,
            as: 'ingredients',
            attributes: ['id', 'name', 'quantity', 'unit', 'category', 'notes', 'store']
          }]
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

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'Meal plan already exists',
          message: 'A meal is already planned for this date and meal type'
        });
      }

      res.status(500).json({
        error: 'Failed to add meal to plan',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

              // Track all ingredient IDs for this consolidated item
              if (!consolidatedIngredients[key].ingredientIds.includes(ingredient.id)) {
                consolidatedIngredients[key].ingredientIds.push(ingredient.id);
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
                usedInMeals: [plan.meal.name],
                ingredientIds: [ingredient.id]
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
          attributes: ['prepTime', 'cookTime', 'servings', 'category', 'difficulty', 'calories', 'protein', 'carbs', 'fat']
        }]
      });

      const stats = {
        totalMeals: mealPlans.length,
        totalCookTime: 0,
        totalPrepTime: 0,
        averageServings: 0,
        categoryCounts: {},
        difficultyCounts: {},
        // Nutrition totals
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        // Track meals with nutrition data for accurate averages
        mealsWithNutrition: 0
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

          // Accumulate nutrition data (only if at least one field is provided)
          const hasNutrition = plan.meal.calories !== null || plan.meal.protein !== null ||
                              plan.meal.carbs !== null || plan.meal.fat !== null;
          if (hasNutrition) {
            stats.mealsWithNutrition++;
            stats.totalCalories += plan.meal.calories || 0;
            stats.totalProtein += plan.meal.protein || 0;
            stats.totalCarbs += plan.meal.carbs || 0;
            stats.totalFat += plan.meal.fat || 0;
          }
        }
      });

      stats.averageServings = stats.totalMeals > 0 ? (totalServings / stats.totalMeals).toFixed(1) : 0;
      stats.totalTime = stats.totalCookTime + stats.totalPrepTime;

      // Calculate nutrition averages (only from meals that have nutrition data)
      if (stats.mealsWithNutrition > 0) {
        stats.avgCalories = Math.round(stats.totalCalories / stats.mealsWithNutrition);
        stats.avgProtein = Math.round(stats.totalProtein / stats.mealsWithNutrition);
        stats.avgCarbs = Math.round(stats.totalCarbs / stats.mealsWithNutrition);
        stats.avgFat = Math.round(stats.totalFat / stats.mealsWithNutrition);
      } else {
        stats.avgCalories = 0;
        stats.avgProtein = 0;
        stats.avgCarbs = 0;
        stats.avgFat = 0;
      }

      res.json(stats);
    } catch (error) {
      console.error('Error fetching meal plan stats:', error);
      res.status(500).json({ error: 'Failed to fetch meal plan statistics' });
    }
  }

  // Copy a week of meal plans to another week
  static async copyWeek(req, res) {
    try {
      const userId = req.userId;
      const { sourceStartDate, targetStartDate, overwrite = false } = req.body;

      if (!sourceStartDate || !targetStartDate) {
        return res.status(400).json({
          error: 'sourceStartDate and targetStartDate are required'
        });
      }

      // Calculate date ranges (7 days from start)
      const sourceStart = new Date(sourceStartDate + 'T00:00:00');
      const sourceEnd = new Date(sourceStart);
      sourceEnd.setDate(sourceEnd.getDate() + 6);

      const targetStart = new Date(targetStartDate + 'T00:00:00');

      // Get all meal plans from source week
      const sourcePlans = await MealPlan.findAll({
        where: {
          userId,
          date: {
            [Op.between]: [sourceStartDate, formatLocalDate(sourceEnd)]
          }
        }
      });

      if (sourcePlans.length === 0) {
        return res.json({
          message: 'No meal plans found in source week',
          created: 0,
          updated: 0,
          skipped: 0
        });
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;

      for (const plan of sourcePlans) {
        // Calculate day offset from source start
        const planDate = new Date(plan.date + 'T00:00:00');
        const dayOffset = Math.round((planDate - sourceStart) / (1000 * 60 * 60 * 24));

        // Calculate target date
        const targetDate = new Date(targetStart);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        const targetDateStr = formatLocalDate(targetDate);

        // Check if meal plan already exists
        const existing = await MealPlan.findOne({
          where: {
            userId,
            date: targetDateStr,
            mealType: plan.mealType
          }
        });

        if (existing) {
          if (overwrite) {
            await existing.update({ mealId: plan.mealId });
            updated++;
          } else {
            skipped++;
          }
        } else {
          await MealPlan.create({
            userId,
            mealId: plan.mealId,
            date: targetDateStr,
            mealType: plan.mealType
          });
          created++;
        }
      }

      res.json({
        message: `Week copied: ${created} created, ${updated} updated, ${skipped} skipped`,
        created,
        updated,
        skipped
      });
    } catch (error) {
      console.error('Error copying week:', error);
      res.status(500).json({ error: 'Failed to copy week' });
    }
  }

  // Save a week's meal plans as a template
  static async saveAsTemplate(req, res) {
    try {
      const userId = req.userId;
      const { weekStartDate, templateName } = req.body;

      if (!weekStartDate || !templateName) {
        return res.status(400).json({
          error: 'weekStartDate and templateName are required'
        });
      }

      // Calculate week end date
      const weekStart = new Date(weekStartDate + 'T00:00:00');
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Get all meal plans for the week
      const mealPlans = await MealPlan.findAll({
        where: {
          userId,
          date: {
            [Op.between]: [weekStartDate, formatLocalDate(weekEnd)]
          }
        }
      });

      if (mealPlans.length === 0) {
        return res.status(400).json({
          error: 'No meal plans found for the specified week'
        });
      }

      // Create the template
      const template = await MealPlanTemplate.create({
        userId,
        name: templateName
      });

      // Create template items from meal plans
      const itemPromises = mealPlans.map(plan => {
        // Calculate day of week (0 = Sunday)
        const planDate = new Date(plan.date + 'T00:00:00');
        const dayOfWeek = planDate.getDay();

        return MealPlanTemplateItem.create({
          templateId: template.id,
          mealId: plan.mealId,
          dayOfWeek,
          mealType: plan.mealType
        });
      });

      await Promise.all(itemPromises);

      // Fetch complete template with items
      const completeTemplate = await MealPlanTemplate.findByPk(template.id, {
        include: [{
          model: MealPlanTemplateItem,
          as: 'items',
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl']
          }]
        }]
      });

      res.status(201).json({
        message: `Template created with ${mealPlans.length} meal plans`,
        template: completeTemplate
      });
    } catch (error) {
      console.error('Error saving week as template:', error);
      res.status(500).json({ error: 'Failed to save week as template' });
    }
  }

  // Generate a consolidated prep plan for multiple meals
  static async generatePrepPlan(req, res) {
    try {
      const userId = req.userId;
      const { meals } = req.body;

      if (!meals || !Array.isArray(meals) || meals.length === 0) {
        return res.status(400).json({
          error: 'meals array is required with at least one meal'
        });
      }

      // Validate each meal request
      for (const meal of meals) {
        if (!meal.mealId || typeof meal.mealId !== 'number') {
          return res.status(400).json({
            error: 'Each meal must have a valid mealId (number)'
          });
        }
        if (!meal.servings || typeof meal.servings !== 'number' || meal.servings < 1) {
          return res.status(400).json({
            error: 'Each meal must have valid servings (number >= 1)'
          });
        }
      }

      const prepPlan = await PrepPlanService.generatePrepPlan(meals, userId);

      res.json(prepPlan);
    } catch (error) {
      console.error('Error generating prep plan:', error);

      if (error.message.includes('not found') || error.message.includes('Access denied')) {
        return res.status(404).json({ error: error.message });
      }

      res.status(500).json({ error: 'Failed to generate prep plan' });
    }
  }
}

module.exports = MealPlansController;
