const NewMealService = require('../services/newMealService');
const { Meal, SearchMeal } = require('../models');

// Add a global meal to personal list
exports.addGlobalMealToPersonal = async (req, res) => {
  try {
    const { searchMealId } = req.params;
    const userId = req.user?.id; // Assuming you have auth middleware

    const meal = await NewMealService.copySearchMealToPersonal(
      searchMealId, 
      userId
    );

    res.status(201).json({
      success: true,
      message: 'Meal added to your personal list',
      data: meal
    });
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Check if user has a meal
exports.checkMealInPersonalList = async (req, res) => {
  try {
    const { searchMealId } = req.params;
    const userId = req.user?.id;

    const hasMeal = await NewMealService.hasSearchMealInPersonalList(
      searchMealId,
      userId
    );

    res.json({
      success: true,
      hasMeal: hasMeal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's meals grouped by source
exports.getUserMeals = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const meals = await NewMealService.getUserMealsBySource(userId);

    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};