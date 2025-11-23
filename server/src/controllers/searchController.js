const { SearchMeal, SearchIngredient } = require('../../models');
const { Op } = require('sequelize');

class SearchController {
    // return the top 10 meals
    static async getTopMeals(req, res) {
        try {
            const { limit = 10 } = req.query;
            
            const meals = await SearchMeal.findAll({
                include: [{
                    model: SearchIngredient,
                    as: 'ingredients',
                    attributes: ['id', 'name', 'quantity', 'unit', 'notes']
                }],
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });

            res.json({
                data: meals,                    // Changed from 'meals' to 'data'
                totalCount: meals.length,       // Changed from 'count'
                success: true
            });
        } catch (error) {
            console.error('Error fetching top meals:', error);
            res.status(500).json({ 
                error: 'Failed to fetch top meals',
                message: error.message,
                success: false
            });
        }
    }

    // return meals that match search criteria
    static async searchMeals(req, res) {
        try {
            const { 
                query,                          // Changed from 'query' to match frontend 'search'
                search,                         // Added 'search' as alias
                category, 
                difficulty, 
                cuisineType,
                maxPrepTime,
                maxCookTime,
                limit = 20, 
                offset = 0 
            } = req.query;

            const whereClause = {};
            
            // Use either 'query' or 'search' parameter
            const searchTerm = query || search;

            // Text search in name and description
            if (searchTerm) {
                whereClause[Op.or] = [
                    { name: { [Op.iLike]: `%${searchTerm}%` } },
                    { description: { [Op.iLike]: `%${searchTerm}%` } },
                    { instructions: { [Op.iLike]: `%${searchTerm}%` } }
                ];
            }

            // Filter by category
            if (category && category !== 'all') {
                whereClause.category = category;
            }

            // Filter by difficulty
            if (difficulty && difficulty !== 'all') {
                whereClause.difficulty = difficulty;
            }

            // Filter by cuisine type
            if (cuisineType && cuisineType !== 'all') {
                whereClause.cuisineType = cuisineType;
            }

            // Filter by max prep time
            if (maxPrepTime) {
                whereClause.prepTime = { [Op.lte]: parseInt(maxPrepTime) };
            }

            // Filter by max cook time
            if (maxCookTime) {
                whereClause.cookTime = { [Op.lte]: parseInt(maxCookTime) };
            }

            const meals = await SearchMeal.findAndCountAll({
                where: whereClause,
                include: [{
                    model: SearchIngredient,
                    as: 'ingredients',
                    attributes: ['id', 'name', 'quantity', 'unit', 'notes']
                }],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['name', 'ASC']]
            });

            res.json({
                data: meals.rows,               // Changed from 'meals' to 'data'
                totalCount: meals.count,
                hasMore: (parseInt(offset) + parseInt(limit)) < meals.count,
                success: true
            });
        } catch (error) {
            console.error('Error searching meals:', error);
            res.status(500).json({ 
                error: 'Failed to search meals',
                message: error.message,
                success: false
            });
        }
    }

    // return meal by id
    static async getMealById(req, res) {
        try {
            const { id } = req.params;
            
            const meal = await SearchMeal.findByPk(id, {
                include: [{
                    model: SearchIngredient,
                    as: 'ingredients',
                    attributes: ['id', 'name', 'quantity', 'unit', 'notes']
                }]
            });

            if (!meal) {
                return res.status(404).json({ 
                    error: 'Meal not found',
                    success: false
                });
            }

            res.json({
                data: meal,                     // Changed to return 'data' property
                success: true
            });
        } catch (error) {
            console.error('Error fetching meal by ID:', error);
            res.status(500).json({ 
                error: 'Failed to fetch meal',
                message: error.message,
                success: false
            });
        }
    }
}

module.exports = SearchController;