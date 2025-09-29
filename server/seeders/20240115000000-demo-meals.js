'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert meals first
    const meals = await queryInterface.bulkInsert('Meals', [
      {
        name: 'Classic Spaghetti Carbonara',
        description: 'Authentic Italian pasta dish with eggs, cheese, and pancetta',
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        instructions: `1. Bring a large pot of salted water to boil and cook spaghetti according to package directions.
2. While pasta cooks, heat a large skillet over medium heat and cook pancetta until crispy.
3. In a bowl, whisk together eggs, Parmesan cheese, salt, and pepper.
4. Drain pasta, reserving 1 cup of pasta water.
5. Add hot pasta to the skillet with pancetta.
6. Remove from heat and quickly stir in egg mixture, adding pasta water as needed.
7. Serve immediately with extra Parmesan and black pepper.`,
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Overnight Oats with Berries',
        description: 'Healthy make-ahead breakfast with oats, yogurt, and fresh berries',
        prepTime: 5,
        cookTime: 0,
        servings: 1,
        difficulty: 'easy',
        category: 'breakfast',
        instructions: `1. In a jar or container, combine oats, chia seeds, and maple syrup.
2. Add milk and yogurt, stir well.
3. Cover and refrigerate overnight.
4. In the morning, top with fresh berries and nuts.
5. Enjoy cold or heat if desired.`,
        imageUrl: 'https://images.unsplash.com/photo-1571212515416-8cf304078ae1?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mediterranean Quinoa Salad',
        description: 'Fresh and healthy salad with quinoa, vegetables, and feta cheese',
        prepTime: 15,
        cookTime: 15,
        servings: 6,
        difficulty: 'easy',
        category: 'lunch',
        instructions: `1. Cook quinoa according to package directions and let cool.
2. Dice cucumber, tomatoes, and red onion.
3. Chop fresh herbs (parsley, mint, dill).
4. In a large bowl, combine cooled quinoa with vegetables and herbs.
5. Whisk together olive oil, lemon juice, salt, and pepper for dressing.
6. Toss salad with dressing and crumbled feta cheese.
7. Chill for 30 minutes before serving.`,
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chicken Stir Fry',
        description: 'Quick and healthy dinner with chicken and mixed vegetables',
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        difficulty: 'easy',
        category: 'dinner',
        instructions: `1. Cut chicken into bite-sized pieces and season with salt and pepper.
2. Heat oil in a large wok or skillet over high heat.
3. Add chicken and cook until golden, about 5 minutes.
4. Add vegetables and stir-fry for 3-4 minutes.
5. Mix sauce ingredients and add to pan.
6. Stir-fry for another 2 minutes until sauce thickens.
7. Serve over rice or noodles.`,
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chocolate Chip Cookies',
        description: 'Classic homemade cookies that are crispy on the outside, chewy inside',
        prepTime: 15,
        cookTime: 12,
        servings: 24,
        difficulty: 'easy',
        category: 'dessert',
        instructions: `1. Preheat oven to 375°F (190°C).
2. In a bowl, cream together butter and both sugars until light and fluffy.
3. Beat in eggs one at a time, then vanilla.
4. In another bowl, whisk together flour, baking soda, and salt.
5. Gradually mix dry ingredients into wet ingredients.
6. Fold in chocolate chips.
7. Drop rounded tablespoons of dough onto ungreased baking sheets.
8. Bake 9-11 minutes until golden brown.
9. Cool on baking sheet for 5 minutes before transferring to wire rack.`,
        imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Avocado Toast',
        description: 'Simple and nutritious breakfast or snack',
        prepTime: 5,
        cookTime: 2,
        servings: 2,
        difficulty: 'easy',
        category: 'breakfast',
        instructions: `1. Toast bread slices until golden brown.
2. Cut avocado in half, remove pit, and scoop flesh into a bowl.
3. Mash avocado with a fork and season with salt, pepper, and lemon juice.
4. Spread mashed avocado on toast.
5. Top with optional toppings like tomatoes, eggs, or red pepper flakes.`,
        imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Get the meal IDs (this works for PostgreSQL)
    const mealResults = await queryInterface.sequelize.query(
      'SELECT id, name FROM "Meals" ORDER BY id'
    );
    const mealIds = mealResults[0];

    // Find meal IDs by name
    const findMealId = (name) => mealIds.find(meal => meal.name === name)?.id;

    // Insert ingredients
    await queryInterface.bulkInsert('Ingredients', [
      // Spaghetti Carbonara ingredients
      {
        name: 'Spaghetti',
        quantity: '1',
        unit: 'lb',
        category: 'pantry',
        mealId: findMealId('Classic Spaghetti Carbonara'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pancetta',
        quantity: '4',
        unit: 'oz',
        category: 'meat',
        mealId: findMealId('Classic Spaghetti Carbonara'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Large Eggs',
        quantity: '3',
        unit: 'pieces',
        category: 'dairy',
        mealId: findMealId('Classic Spaghetti Carbonara'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Parmesan Cheese',
        quantity: '1',
        unit: 'cup',
        category: 'dairy',
        mealId: findMealId('Classic Spaghetti Carbonara'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Black Pepper',
        quantity: '1',
        unit: 'tsp',
        category: 'spices',
        mealId: findMealId('Classic Spaghetti Carbonara'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Overnight Oats ingredients
      {
        name: 'Rolled Oats',
        quantity: '1/2',
        unit: 'cup',
        category: 'pantry',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chia Seeds',
        quantity: '1',
        unit: 'tbsp',
        category: 'pantry',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Greek Yogurt',
        quantity: '1/4',
        unit: 'cup',
        category: 'dairy',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Milk',
        quantity: '1/2',
        unit: 'cup',
        category: 'dairy',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mixed Berries',
        quantity: '1/2',
        unit: 'cup',
        category: 'produce',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Maple Syrup',
        quantity: '1',
        unit: 'tbsp',
        category: 'pantry',
        mealId: findMealId('Overnight Oats with Berries'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Mediterranean Quinoa Salad ingredients
      {
        name: 'Quinoa',
        quantity: '1',
        unit: 'cup',
        category: 'pantry',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cucumber',
        quantity: '2',
        unit: 'pieces',
        category: 'produce',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cherry Tomatoes',
        quantity: '2',
        unit: 'cups',
        category: 'produce',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Red Onion',
        quantity: '1/2',
        unit: 'piece',
        category: 'produce',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Feta Cheese',
        quantity: '4',
        unit: 'oz',
        category: 'dairy',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Parsley',
        quantity: '1/2',
        unit: 'cup',
        category: 'produce',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Olive Oil',
        quantity: '3',
        unit: 'tbsp',
        category: 'pantry',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lemon Juice',
        quantity: '2',
        unit: 'tbsp',
        category: 'produce',
        mealId: findMealId('Mediterranean Quinoa Salad'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Chicken Stir Fry ingredients
      {
        name: 'Chicken Breast',
        quantity: '1',
        unit: 'lb',
        category: 'meat',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bell Peppers',
        quantity: '2',
        unit: 'pieces',
        category: 'produce',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Broccoli',
        quantity: '2',
        unit: 'cups',
        category: 'produce',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Soy Sauce',
        quantity: '3',
        unit: 'tbsp',
        category: 'pantry',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Garlic',
        quantity: '3',
        unit: 'cloves',
        category: 'produce',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ginger',
        quantity: '1',
        unit: 'tbsp',
        category: 'produce',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vegetable Oil',
        quantity: '2',
        unit: 'tbsp',
        category: 'pantry',
        mealId: findMealId('Chicken Stir Fry'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Chocolate Chip Cookies ingredients
      {
        name: 'All-Purpose Flour',
        quantity: '2 1/4',
        unit: 'cups',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Butter',
        quantity: '1',
        unit: 'cup',
        category: 'dairy',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Brown Sugar',
        quantity: '3/4',
        unit: 'cup',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'White Sugar',
        quantity: '1/4',
        unit: 'cup',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Large Eggs',
        quantity: '2',
        unit: 'pieces',
        category: 'dairy',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Vanilla Extract',
        quantity: '2',
        unit: 'tsp',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Chocolate Chips',
        quantity: '2',
        unit: 'cups',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Baking Soda',
        quantity: '1',
        unit: 'tsp',
        category: 'pantry',
        mealId: findMealId('Chocolate Chip Cookies'),
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Avocado Toast ingredients
      {
        name: 'Whole Grain Bread',
        quantity: '2',
        unit: 'slices',
        category: 'pantry',
        mealId: findMealId('Avocado Toast'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ripe Avocado',
        quantity: '1',
        unit: 'piece',
        category: 'produce',
        mealId: findMealId('Avocado Toast'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lemon Juice',
        quantity: '1',
        unit: 'tbsp',
        category: 'produce',
        mealId: findMealId('Avocado Toast'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Salt',
        quantity: '1/4',
        unit: 'tsp',
        category: 'spices',
        mealId: findMealId('Avocado Toast'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Black Pepper',
        quantity: '1/4',
        unit: 'tsp',
        category: 'spices',
        mealId: findMealId('Avocado Toast'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Ingredients', null, {});
    await queryInterface.bulkDelete('Meals', null, {});
  }
};