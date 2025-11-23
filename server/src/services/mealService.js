const { Meal, Ingredient, SearchMeal, SearchIngredient } = require('../../models');
const { Op } = require('sequelize');

class MealService {
    /**
     * Get all meals with pagination and filtering
     */
    static async getAllMeals({ category, search, limit = 50, offset = 0 }) {
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
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'category']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return {
            data: meals.rows,
            totalCount: meals.count,
            hasMore: (parseInt(offset) + parseInt(limit)) < meals.count
        };
    }

    /**
     * Get a single meal by ID
     */
    static async getMealById(id) {
        const meal = await Meal.findByPk(id, {
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'category']
            }]
        });

        if (!meal) {
            throw new Error('Meal not found');
        }

        return meal;
    }

    /**
     * Create a new meal
     */
    static async createMeal(mealData, ingredients) {
        // Parse numeric fields
        if (mealData.prepTime !== undefined) {
            mealData.prepTime = parseInt(mealData.prepTime) || null;
        }
        if (mealData.cookTime !== undefined) {
            mealData.cookTime = parseInt(mealData.cookTime) || null;
        }
        if (mealData.servings !== undefined) {
            mealData.servings = parseInt(mealData.servings) || 1;
        }

        // Create meal
        const meal = await Meal.create(mealData);

        // Create ingredients if provided
        if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
            const ingredientPromises = ingredients.map(ingredient =>
                Ingredient.create({
                    ...ingredient,
                    mealId: meal.id
                })
            );
            await Promise.all(ingredientPromises);
        }

        // Fetch the complete meal with ingredients
        return await this.getMealById(meal.id);
    }

    /**
     * Update an existing meal
     */
    static async updateMeal(id, mealData, ingredients) {
        // Parse numeric fields
        if (mealData.prepTime !== undefined) {
            mealData.prepTime = parseInt(mealData.prepTime) || null;
        }
        if (mealData.cookTime !== undefined) {
            mealData.cookTime = parseInt(mealData.cookTime) || null;
        }
        if (mealData.servings !== undefined) {
            mealData.servings = parseInt(mealData.servings) || 1;
        }

        const [updatedCount] = await Meal.update(mealData, {
            where: { id }
        });

        if (updatedCount === 0) {
            throw new Error('Meal not found');
        }

        // Update ingredients if provided
        if (ingredients && Array.isArray(ingredients)) {
            // Delete existing ingredients
            await Ingredient.destroy({ where: { mealId: id } });

            // Create new ingredients
            if (ingredients.length > 0) {
                const ingredientPromises = ingredients.map(ingredient =>
                    Ingredient.create({
                        ...ingredient,
                        mealId: id
                    })
                );
                await Promise.all(ingredientPromises);
            }
        }

        return await this.getMealById(id);
    }

    /**
     * Delete a meal
     */
    static async deleteMeal(id) {
        const deletedCount = await Meal.destroy({ where: { id } });

        if (deletedCount === 0) {
            throw new Error('Meal not found');
        }

        return true;
    }

    /**
     * Check if a global meal exists in personal collection
     */
    static async checkGlobalMeal(id) {
        const numPresent = await Meal.findAndCountAll({ where: { id } });
        return numPresent.count > 0;
    }

    /**
     * Add a global meal to personal collection
     */
    static async addGlobalMeal(id) {
        // Find the global meal with its ingredients
        const globalMeal = await SearchMeal.findByPk(id, {
            include: [{
                model: SearchIngredient,
                as: 'ingredients'
            }]
        });

        if (!globalMeal) {
            throw new Error('Global meal not found');
        }

        // Check if meal already exists in personal collection
        const existingMeal = await Meal.findOne({
            where: {
                name: globalMeal.name,
                description: globalMeal.description
            }
        });

        if (existingMeal) {
            const error = new Error('Meal already exists in your collection');
            error.code = 'DUPLICATE_MEAL';
            error.data = { mealId: existingMeal.id };
            throw error;
        }

        // Create the meal in the personal collection
        const mealData = {
            name: globalMeal.name,
            description: globalMeal.description,
            prepTime: globalMeal.prepTime,
            cookTime: globalMeal.cookTime,
            servings: globalMeal.servings,
            difficulty: globalMeal.difficulty,
            category: globalMeal.category,
            instructions: globalMeal.instructions,
            imageUrl: globalMeal.imageUrl,
            cuisineType: globalMeal.cuisineType
        };

        const newMeal = await Meal.create(mealData);

        // Copy ingredients to the personal collection
        if (globalMeal.ingredients && globalMeal.ingredients.length > 0) {
            const ingredientPromises = globalMeal.ingredients.map(ingredient => {
                // Append notes to name if present, as Ingredient model doesn't have notes field
                // and category is an enum
                const nameWithNotes = ingredient.notes
                    ? `${ingredient.name} (${ingredient.notes})`
                    : ingredient.name;

                return Ingredient.create({
                    name: nameWithNotes,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    category: 'other', // Default to 'other' as we can't reliably map notes to category enum
                    mealId: newMeal.id
                });
            });
            await Promise.all(ingredientPromises);
        }

        // Fetch the complete meal with ingredients
        return await this.getMealById(newMeal.id);
    }
}

module.exports = MealService;
