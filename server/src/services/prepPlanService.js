// server/src/services/prepPlanService.js
const { Meal, Ingredient } = require('../../models');
const {
  parseQuantity,
  formatQuantity,
  consolidateIngredients,
  scaleQuantity
} = require('../utils/unitConverter');

class PrepPlanService {
  /**
   * Generate a consolidated prep plan for multiple meals
   * @param {Array} mealRequests - Array of { mealId, servings }
   * @param {number} userId - The user making the request
   * @returns {Object} Prep plan with ingredients, steps, and time estimates
   */
  static async generatePrepPlan(mealRequests, userId) {
    if (!mealRequests || !Array.isArray(mealRequests) || mealRequests.length === 0) {
      throw new Error('At least one meal is required');
    }

    const mealIds = mealRequests.map(m => m.mealId);

    // Fetch all requested meals with ingredients
    const meals = await Meal.findAll({
      where: {
        id: mealIds
      },
      include: [{
        model: Ingredient,
        as: 'ingredients'
      }]
    });

    // Validate all meals exist and user has access
    const foundMealIds = meals.map(m => m.id);
    const missingMeals = mealIds.filter(id => !foundMealIds.includes(id));
    if (missingMeals.length > 0) {
      throw new Error(`Meals not found: ${missingMeals.join(', ')}`);
    }

    // Validate user access (must own meal or meal is public)
    for (const meal of meals) {
      if (meal.visibility !== 'public' && meal.userId !== userId) {
        throw new Error(`Access denied to meal: ${meal.name}`);
      }
    }

    // Create a map of mealId to requested servings
    const servingsMap = {};
    mealRequests.forEach(req => {
      servingsMap[req.mealId] = req.servings;
    });

    // Process ingredients with scaling
    const allIngredients = [];
    const mealSummary = [];
    let mealsWithoutStructuredInstructions = [];

    for (const meal of meals) {
      const requestedServings = servingsMap[meal.id];
      const originalServings = meal.servings || 1;
      const scalingRatio = requestedServings / originalServings;

      mealSummary.push({
        mealId: meal.id,
        name: meal.name,
        servings: requestedServings,
        originalServings,
        scalingRatio,
        hasStructuredInstructions: !!(meal.structuredInstructions && meal.structuredInstructions.length > 0)
      });

      if (!meal.structuredInstructions || meal.structuredInstructions.length === 0) {
        mealsWithoutStructuredInstructions.push(meal.name);
      }

      // Scale and collect ingredients
      if (meal.ingredients) {
        for (const ingredient of meal.ingredients) {
          const scaledQuantity = scaleQuantity(ingredient.quantity, scalingRatio);
          allIngredients.push({
            name: ingredient.name,
            quantity: scaledQuantity,
            unit: ingredient.unit,
            category: ingredient.category || 'other',
            usedInMeals: [meal.name]
          });
        }
      }
    }

    // Consolidate ingredients
    const consolidatedIngredients = consolidateIngredients(allIngredients);

    // Group ingredients by category
    const ingredientsByCategory = {};
    consolidatedIngredients.forEach(ing => {
      const cat = ing.category || 'other';
      if (!ingredientsByCategory[cat]) {
        ingredientsByCategory[cat] = [];
      }
      ingredientsByCategory[cat].push(ing);
    });

    // Collect and organize structured instructions
    const prepPlan = {
      prepSteps: [],
      cookingSteps: [],
      assemblySteps: [],
      restingSteps: []
    };

    let totalPrepTime = 0;
    let totalCookTime = 0;

    for (const meal of meals) {
      if (meal.structuredInstructions && meal.structuredInstructions.length > 0) {
        meal.structuredInstructions.forEach(step => {
          const prefixedStep = {
            ...step,
            action: `[${meal.name}] ${step.action}`,
            mealName: meal.name,
            mealId: meal.id
          };

          const duration = step.duration || 0;
          const category = step.category || 'prep';

          switch (category) {
            case 'prep':
              prepPlan.prepSteps.push(prefixedStep);
              totalPrepTime += duration;
              break;
            case 'cooking':
              prepPlan.cookingSteps.push(prefixedStep);
              totalCookTime += duration;
              break;
            case 'assembly':
              prepPlan.assemblySteps.push(prefixedStep);
              break;
            case 'resting':
              prepPlan.restingSteps.push(prefixedStep);
              break;
            default:
              prepPlan.prepSteps.push(prefixedStep);
              totalPrepTime += duration;
          }
        });
      } else if (meal.instructions) {
        // Fallback: add freeform instructions as a single prep step
        prepPlan.prepSteps.push({
          stepNumber: 0,
          action: `[${meal.name}] ${meal.instructions}`,
          duration: meal.prepTime || 0,
          mealName: meal.name,
          mealId: meal.id,
          isFreeform: true
        });
        totalPrepTime += meal.prepTime || 0;
        totalCookTime += meal.cookTime || 0;
      }
    }

    // Sort steps within each category by duration (shorter tasks first for parallelization)
    const sortByDuration = (a, b) => (a.duration || 0) - (b.duration || 0);
    prepPlan.prepSteps.sort(sortByDuration);
    prepPlan.cookingSteps.sort(sortByDuration);
    prepPlan.assemblySteps.sort(sortByDuration);
    prepPlan.restingSteps.sort(sortByDuration);

    // Renumber steps within each category
    let stepCounter = 1;
    prepPlan.prepSteps = prepPlan.prepSteps.map(s => ({ ...s, stepNumber: stepCounter++ }));
    stepCounter = 1;
    prepPlan.cookingSteps = prepPlan.cookingSteps.map(s => ({ ...s, stepNumber: stepCounter++ }));
    stepCounter = 1;
    prepPlan.assemblySteps = prepPlan.assemblySteps.map(s => ({ ...s, stepNumber: stepCounter++ }));
    stepCounter = 1;
    prepPlan.restingSteps = prepPlan.restingSteps.map(s => ({ ...s, stepNumber: stepCounter++ }));

    // Calculate resting time from steps
    const totalRestingTime = prepPlan.restingSteps.reduce((sum, step) => sum + (step.duration || 0), 0);
    const totalAssemblyTime = prepPlan.assemblySteps.reduce((sum, step) => sum + (step.duration || 0), 0);

    return {
      ingredients: consolidatedIngredients,
      ingredientsByCategory,
      prepPlan,
      totalPrepTime,
      totalCookTime,
      totalAssemblyTime,
      totalRestingTime,
      totalTime: totalPrepTime + totalCookTime + totalAssemblyTime + totalRestingTime,
      mealSummary,
      warnings: mealsWithoutStructuredInstructions.length > 0 ? {
        mealsWithoutStructuredInstructions,
        message: `The following meals don't have structured instructions and will use freeform instructions: ${mealsWithoutStructuredInstructions.join(', ')}`
      } : null
    };
  }
}

module.exports = PrepPlanService;