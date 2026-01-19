const { RecurringMeal, Meal, MealPlan } = require('../../models');
const { Op } = require('sequelize');

// Format date to YYYY-MM-DD in local timezone (avoids UTC shift from toISOString)
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

class RecurringMealsController {
  // Get all recurring meals for the current user
  static async getRecurringMeals(req, res) {
    try {
      const userId = req.userId;

      const recurringMeals = await RecurringMeal.findAll({
        where: { userId },
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['id', 'name', 'category', 'imageUrl', 'prepTime', 'cookTime']
        }],
        order: [['dayOfWeek', 'ASC'], ['mealType', 'ASC']]
      });

      res.json({
        recurringMeals,
        count: recurringMeals.length
      });
    } catch (error) {
      console.error('Error fetching recurring meals:', error);
      res.status(500).json({ error: 'Failed to fetch recurring meals' });
    }
  }

  // Create a new recurring meal
  static async createRecurringMeal(req, res) {
    try {
      const userId = req.userId;
      const { mealId, dayOfWeek, mealType } = req.body;

      if (mealId === undefined || dayOfWeek === undefined || !mealType) {
        return res.status(400).json({
          error: 'mealId, dayOfWeek, and mealType are required'
        });
      }

      // Verify meal exists and user has access
      const meal = await Meal.findByPk(mealId);
      if (!meal) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      // Only allow user's own private meals or public meals
      if (meal.visibility === 'private' && meal.userId !== userId) {
        return res.status(404).json({ error: 'Meal not found' });
      }

      // Check if recurring meal already exists for this slot
      const existing = await RecurringMeal.findOne({
        where: { userId, dayOfWeek, mealType }
      });

      if (existing) {
        // Update existing recurring meal
        await existing.update({ mealId, isActive: true });

        const updated = await RecurringMeal.findByPk(existing.id, {
          include: [{
            model: Meal,
            as: 'meal',
            attributes: ['id', 'name', 'category', 'imageUrl', 'prepTime', 'cookTime']
          }]
        });

        return res.json({
          recurringMeal: updated,
          updated: true
        });
      }

      // Create new recurring meal
      const recurringMeal = await RecurringMeal.create({
        userId,
        mealId,
        dayOfWeek,
        mealType,
        isActive: true
      });

      const newRecurringMeal = await RecurringMeal.findByPk(recurringMeal.id, {
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['id', 'name', 'category', 'imageUrl', 'prepTime', 'cookTime']
        }]
      });

      res.status(201).json({
        recurringMeal: newRecurringMeal,
        created: true
      });
    } catch (error) {
      console.error('Error creating recurring meal:', error);

      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(e => e.message)
        });
      }

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: 'A recurring meal already exists for this day and meal type'
        });
      }

      res.status(500).json({ error: 'Failed to create recurring meal' });
    }
  }

  // Update a recurring meal
  static async updateRecurringMeal(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { mealId, isActive } = req.body;

      const recurringMeal = await RecurringMeal.findOne({
        where: { id, userId }
      });

      if (!recurringMeal) {
        return res.status(404).json({ error: 'Recurring meal not found' });
      }

      // If updating mealId, verify meal exists and user has access
      if (mealId !== undefined) {
        const meal = await Meal.findByPk(mealId);
        if (!meal) {
          return res.status(404).json({ error: 'Meal not found' });
        }
        if (meal.visibility === 'private' && meal.userId !== userId) {
          return res.status(404).json({ error: 'Meal not found' });
        }
      }

      const updateData = {};
      if (mealId !== undefined) updateData.mealId = mealId;
      if (isActive !== undefined) updateData.isActive = isActive;

      await recurringMeal.update(updateData);

      const updated = await RecurringMeal.findByPk(id, {
        include: [{
          model: Meal,
          as: 'meal',
          attributes: ['id', 'name', 'category', 'imageUrl', 'prepTime', 'cookTime']
        }]
      });

      res.json({ recurringMeal: updated });
    } catch (error) {
      console.error('Error updating recurring meal:', error);
      res.status(500).json({ error: 'Failed to update recurring meal' });
    }
  }

  // Delete a recurring meal
  static async deleteRecurringMeal(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;

      const deletedCount = await RecurringMeal.destroy({
        where: { id, userId }
      });

      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Recurring meal not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting recurring meal:', error);
      res.status(500).json({ error: 'Failed to delete recurring meal' });
    }
  }

  // Apply recurring meals to a date range
  static async applyRecurringMeals(req, res) {
    try {
      const userId = req.userId;
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'startDate and endDate are required'
        });
      }

      // Get all active recurring meals for the user
      const recurringMeals = await RecurringMeal.findAll({
        where: { userId, isActive: true }
      });

      if (recurringMeals.length === 0) {
        return res.json({
          message: 'No active recurring meals to apply',
          created: 0,
          skipped: 0
        });
      }

      let created = 0;
      let skipped = 0;

      // Iterate through each day in the range
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');

      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.getDay();
        const dateStr = formatLocalDate(date);

        // Find recurring meals for this day of week
        const mealsForDay = recurringMeals.filter(rm => rm.dayOfWeek === dayOfWeek);

        for (const recurringMeal of mealsForDay) {
          // Check if meal plan already exists for this date/mealType
          const existing = await MealPlan.findOne({
            where: {
              userId,
              date: dateStr,
              mealType: recurringMeal.mealType
            }
          });

          if (existing) {
            skipped++;
            continue;
          }

          // Create the meal plan
          await MealPlan.create({
            userId,
            mealId: recurringMeal.mealId,
            date: dateStr,
            mealType: recurringMeal.mealType
          });

          created++;
        }
      }

      res.json({
        message: `Applied recurring meals: ${created} created, ${skipped} skipped (already exist)`,
        created,
        skipped
      });
    } catch (error) {
      console.error('Error applying recurring meals:', error);
      res.status(500).json({ error: 'Failed to apply recurring meals' });
    }
  }
}

module.exports = RecurringMealsController;
