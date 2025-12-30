const { Meal, Ingredient } = require('../../models');
const { Op } = require('sequelize');

class MealService {
    /**
     * Get all private meals for a user with pagination and filtering
     */
    static async getAllMeals({ category, cuisineType, search, limit = 50, offset = 0, userId }) {
        const whereClause = {
            visibility: 'private'
        };

        // Filter by user ID (required for private meals)
        if (userId) {
            whereClause.userId = userId;
        }

        if (category && category !== 'all') {
            whereClause.category = category;
        }

        if (cuisineType && cuisineType !== 'all') {
            whereClause.cuisineType = cuisineType;
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
                attributes: ['id', 'name', 'quantity', 'unit', 'category', 'notes']
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
     * Get a single meal by ID (with optional user ownership check)
     */
    static async getMealById(id, userId = null) {
        const whereClause = { id };

        // If userId is provided, also check ownership for private meals
        const meal = await Meal.findByPk(id, {
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'category', 'notes']
            }]
        });

        if (!meal) {
            throw new Error('Meal not found');
        }

        // If it's a private meal, check ownership
        if (meal.visibility === 'private' && userId && meal.userId !== userId) {
            throw new Error('Meal not found');
        }

        return meal;
    }

    /**
     * Create a new meal for a user
     */
    static async createMeal(mealData, ingredients, userId) {
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

        // Parse nutrition fields
        if (mealData.calories !== undefined) {
            mealData.calories = mealData.calories === '' || mealData.calories === null ? null : parseInt(mealData.calories);
        }
        if (mealData.protein !== undefined) {
            mealData.protein = mealData.protein === '' || mealData.protein === null ? null : parseInt(mealData.protein);
        }
        if (mealData.carbs !== undefined) {
            mealData.carbs = mealData.carbs === '' || mealData.carbs === null ? null : parseInt(mealData.carbs);
        }
        if (mealData.fat !== undefined) {
            mealData.fat = mealData.fat === '' || mealData.fat === null ? null : parseInt(mealData.fat);
        }

        // Ensure visibility is set to private for user-created meals
        mealData.visibility = 'private';

        // Set the user ID
        mealData.userId = userId;

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
     * Update an existing meal (with ownership check)
     */
    static async updateMeal(id, mealData, ingredients, userId) {
        // First check if meal exists and user owns it
        const existingMeal = await Meal.findByPk(id);

        if (!existingMeal) {
            throw new Error('Meal not found');
        }

        // Check ownership for private meals
        if (existingMeal.visibility === 'private' && existingMeal.userId !== userId) {
            throw new Error('Meal not found');
        }

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

        // Parse nutrition fields
        if (mealData.calories !== undefined) {
            mealData.calories = mealData.calories === '' || mealData.calories === null ? null : parseInt(mealData.calories);
        }
        if (mealData.protein !== undefined) {
            mealData.protein = mealData.protein === '' || mealData.protein === null ? null : parseInt(mealData.protein);
        }
        if (mealData.carbs !== undefined) {
            mealData.carbs = mealData.carbs === '' || mealData.carbs === null ? null : parseInt(mealData.carbs);
        }
        if (mealData.fat !== undefined) {
            mealData.fat = mealData.fat === '' || mealData.fat === null ? null : parseInt(mealData.fat);
        }

        // Don't allow changing userId
        delete mealData.userId;

        await Meal.update(mealData, {
            where: { id }
        });

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
     * Delete a meal (with ownership check)
     */
    static async deleteMeal(id, userId) {
        // First check if meal exists and user owns it
        const existingMeal = await Meal.findByPk(id);

        if (!existingMeal) {
            throw new Error('Meal not found');
        }

        // Check ownership for private meals
        if (existingMeal.visibility === 'private' && existingMeal.userId !== userId) {
            throw new Error('Meal not found');
        }

        await Meal.destroy({ where: { id } });
        return true;
    }

    /**
     * Get all public meals with pagination and filtering
     */
    static async getPublicMeals({
        search,
        category,
        cuisineType,
        difficulty,
        maxPrepTime,
        maxCookTime,
        limit = 20,
        offset = 0
    }) {
        const whereClause = {
            visibility: 'public'
        };

        // Text search in name, description, and instructions
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { instructions: { [Op.iLike]: `%${search}%` } }
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

        const meals = await Meal.findAndCountAll({
            where: whereClause,
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'notes']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
        });

        return {
            data: meals.rows,
            totalCount: meals.count,
            hasMore: (parseInt(offset) + parseInt(limit)) < meals.count
        };
    }

    /**
     * Get top N public meals
     */
    static async getTopPublicMeals(limit = 10) {
        const meals = await Meal.findAll({
            where: { visibility: 'public' },
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'notes']
            }],
            limit: parseInt(limit),
            order: [['createdAt', 'DESC']]
        });

        return {
            data: meals,
            totalCount: meals.length
        };
    }

    /**
     * Get a single public meal by ID
     */
    static async getPublicMealById(id) {
        const meal = await Meal.findOne({
            where: { id, visibility: 'public' },
            include: [{
                model: Ingredient,
                as: 'ingredients',
                attributes: ['id', 'name', 'quantity', 'unit', 'notes']
            }]
        });

        if (!meal) {
            throw new Error('Public meal not found');
        }

        return meal;
    }

    /**
     * Check if a public meal exists in user's private collection
     */
    static async checkPublicMeal(publicMealId, userId) {
        if (!userId) {
            return false;
        }

        // First find the public meal to get its name
        const publicMeal = await Meal.findOne({
            where: { id: publicMealId, visibility: 'public' }
        });

        if (!publicMeal) {
            return false;
        }

        // Check if a private meal with the same name exists for this user
        const existingMeal = await Meal.findOne({
            where: {
                name: publicMeal.name,
                visibility: 'private',
                userId: userId
            }
        });

        return !!existingMeal;
    }

    /**
     * Add a public meal to user's private collection
     */
    static async addPublicMeal(publicMealId, userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        // Find the public meal with its ingredients
        const publicMeal = await Meal.findOne({
            where: { id: publicMealId, visibility: 'public' },
            include: [{
                model: Ingredient,
                as: 'ingredients'
            }]
        });

        if (!publicMeal) {
            throw new Error('Public meal not found');
        }

        // Check if meal already exists in user's private collection
        const existingMeal = await Meal.findOne({
            where: {
                name: publicMeal.name,
                visibility: 'private',
                userId: userId
            }
        });

        if (existingMeal) {
            const error = new Error('Meal already exists in your collection');
            error.code = 'DUPLICATE_MEAL';
            error.data = { mealId: existingMeal.id };
            throw error;
        }

        // Create the meal in the private collection
        const mealData = {
            name: publicMeal.name,
            description: publicMeal.description,
            prepTime: publicMeal.prepTime,
            cookTime: publicMeal.cookTime,
            servings: publicMeal.servings,
            difficulty: publicMeal.difficulty,
            category: publicMeal.category,
            instructions: publicMeal.instructions,
            imageUrl: publicMeal.imageUrl,
            cuisineType: publicMeal.cuisineType,
            visibility: 'private',
            userId: userId
        };

        const newMeal = await Meal.create(mealData);

        // Copy ingredients to the private collection
        if (publicMeal.ingredients && publicMeal.ingredients.length > 0) {
            const ingredientPromises = publicMeal.ingredients.map(ingredient => {
                return Ingredient.create({
                    name: ingredient.name,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit,
                    notes: ingredient.notes,
                    category: ingredient.category || 'other',
                    mealId: newMeal.id
                });
            });
            await Promise.all(ingredientPromises);
        }

        // Fetch the complete meal with ingredients
        return await this.getMealById(newMeal.id);
    }

    /**
     * Update ingredient store assignment
     */
    static async updateIngredientStore(ingredientId, store, userId) {
        // Find the ingredient
        const ingredient = await Ingredient.findByPk(ingredientId, {
            include: [{
                model: Meal,
                as: 'meal',
                attributes: ['id', 'userId', 'visibility']
            }]
        });

        if (!ingredient) {
            throw new Error('Ingredient not found');
        }

        // Verify ownership - user must own the meal this ingredient belongs to
        if (ingredient.meal.visibility === 'private' && ingredient.meal.userId !== userId) {
            throw new Error('Not authorized');
        }

        // Update the store
        await ingredient.update({ store });

        return ingredient;
    }
}

module.exports = MealService;
