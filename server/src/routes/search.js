const express = require('express');
const searchController = require('../controllers/searchController');
const router = express.Router();

// GET /api/search-meals/top
router.get('/top', searchController.getTopMeals);

// GET /api/search-meals/search
router.get('/search', searchController.searchMeals);

// GET /api/search-meals/:searchMealId
router.get('/:id', searchController.getMealById);

module.exports = router;