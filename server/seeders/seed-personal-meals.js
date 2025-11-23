// seed-personal-meals.js
// Run with: node seed-personal-meals.js

const { Meal, Ingredient, sequelize } = require('../models');

async function seedPersonalMeals() {
  try {
    console.log('Starting personal meals seeding...');
    
    // Optional: Clear existing data (comment out if you want to keep existing meals)
    // console.log('Clearing existing personal meals...');
    // await Ingredient.destroy({ where: {}, truncate: true, cascade: true });
    // await Meal.destroy({ where: {}, truncate: true, cascade: true });

    console.log('Creating personal meals...');
    
    // Create meals with ingredients
    const meals = [
      {
        name: 'My Favorite Pasta',
        description: 'A simple and delicious pasta dish I make often',
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        difficulty: 'easy',
        category: 'dinner',
        cuisineType: 'Italian',
        instructions: '1. Boil pasta. 2. Make sauce with tomatoes and garlic. 3. Combine and serve.',
        imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
        ingredients: [
          { name: 'Pasta', quantity: 8, unit: 'oz', category: 'pantry' },
          { name: 'Tomatoes', quantity: 2, unit: 'whole', category: 'produce' },
          { name: 'Garlic', quantity: 3, unit: 'cloves', category: 'produce' },
          { name: 'Olive oil', quantity: 2, unit: 'tbsp', category: 'pantry' }
        ]
      },
      {
        name: 'Quick Breakfast Smoothie',
        description: 'My go-to morning smoothie',
        prepTime: 5,
        cookTime: 0,
        servings: 1,
        difficulty: 'easy',
        category: 'breakfast',
        cuisineType: 'American',
        instructions: '1. Add all ingredients to blender. 2. Blend until smooth. 3. Enjoy!',
        imageUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625',
        ingredients: [
          { name: 'Banana', quantity: 1, unit: 'whole', category: 'produce' },
          { name: 'Spinach', quantity: 1, unit: 'cup', category: 'produce' },
          { name: 'Almond milk', quantity: 1, unit: 'cup', category: 'dairy' },
          { name: 'Protein powder', quantity: 1, unit: 'scoop', category: 'other' }
        ]
      },
      {
        name: 'Grilled Chicken Salad',
        description: 'Healthy lunch option with grilled chicken',
        prepTime: 15,
        cookTime: 10,
        servings: 2,
        difficulty: 'easy',
        category: 'lunch',
        cuisineType: 'American',
        instructions: '1. Grill chicken breast. 2. Chop vegetables. 3. Assemble salad. 4. Add dressing.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        ingredients: [
          { name: 'Chicken breast', quantity: 2, unit: 'pieces', category: 'meat' },
          { name: 'Mixed greens', quantity: 4, unit: 'cups', category: 'produce' },
          { name: 'Cherry tomatoes', quantity: 1, unit: 'cup', category: 'produce' },
          { name: 'Cucumber', quantity: 1, unit: 'whole', category: 'produce' },
          { name: 'Balsamic vinaigrette', quantity: 3, unit: 'tbsp', category: 'spices' }
        ]
      },
      {
        name: 'Homemade Pizza Night',
        description: 'Family favorite for Friday nights',
        prepTime: 30,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Italian',
        instructions: '1. Prepare dough. 2. Add sauce and toppings. 3. Bake at 450°F for 12-15 minutes.',
        imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
        ingredients: [
          { name: 'Pizza dough', quantity: 1, unit: 'lb', category: 'other' },
          { name: 'Pizza sauce', quantity: 1, unit: 'cup', category: 'pantry' },
          { name: 'Mozzarella cheese', quantity: 2, unit: 'cups', category: 'dairy' },
          { name: 'Pepperoni', quantity: 20, unit: 'slices', category: 'meat' },
          { name: 'Bell peppers', quantity: 1, unit: 'whole', category: 'produce' }
        ]
      },
      {
        name: 'Simple Veggie Stir Fry',
        description: 'Quick weeknight dinner with whatever vegetables I have',
        prepTime: 10,
        cookTime: 8,
        servings: 2,
        difficulty: 'easy',
        category: 'dinner',
        cuisineType: 'Chinese',
        instructions: '1. Chop vegetables. 2. Heat wok. 3. Stir fry vegetables. 4. Add sauce and serve over rice.',
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        ingredients: [
          { name: 'Broccoli', quantity: 2, unit: 'cups', category: 'produce' },
          { name: 'Carrots', quantity: 2, unit: 'whole', category: 'produce' },
          { name: 'Snow peas', quantity: 1, unit: 'cup', category: 'produce' },
          { name: 'Soy sauce', quantity: 3, unit: 'tbsp', category: 'pantry' },
          { name: 'Ginger', quantity: 1, unit: 'tbsp', category: 'spices' },
          { name: 'Rice', quantity: 2, unit: 'cups', category: 'pantry' }
        ]
      }
    ];

    // Create meals and their ingredients
    for (const mealData of meals) {
      const { ingredients, ...mealInfo } = mealData;
      
      console.log(`Creating meal: ${mealInfo.name}`);
      const meal = await Meal.create(mealInfo);
      
      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await Ingredient.create({
            ...ingredient,
            mealId: meal.id
          });
        }
      }
    }

    console.log('\n✅ Personal meals seeding completed successfully!');
    console.log(`Created ${meals.length} personal meals with their ingredients.`);
    
    // Close database connection
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error seeding personal meals:', error);
    process.exit(1);
  }
}

// Run the seeder
seedPersonalMeals();