// run-seeder.js
// Standalone seeder script that can be run with: node run-seeder.js

const { SearchMeal, SearchIngredient, sequelize } = require('../models');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear existing data (optional - remove if you want to keep existing data)
    //console.log('Clearing existing SearchIngredients...');
    //await SearchIngredient.destroy({ where: {}, truncate: true, cascade: true });
    
    //console.log('Clearing existing SearchMeals...');
    //await SearchMeal.destroy({ where: {}, truncate: true, cascade: true });

    console.log('Creating meals...');
    
    // Create meals with ingredients
    const meals = [
      {
        name: 'Classic Spaghetti Carbonara',
        description: 'Traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper',
        prepTime: 10,
        cookTime: 20,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Italian',
        instructions: '1. Cook spaghetti according to package directions. 2. Fry pancetta until crispy. 3. Beat eggs with parmesan. 4. Toss hot pasta with pancetta, then remove from heat and mix in egg mixture. 5. Season with black pepper and serve immediately.',
        imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
        source: 'global',
        ingredients: [
          { name: 'Spaghetti', quantity: 1, unit: 'lb', notes: 'Regular or whole wheat' },
          { name: 'Pancetta', quantity: 6, unit: 'oz', notes: 'Diced' },
          { name: 'Eggs', quantity: 4, unit: 'whole', notes: 'Large' },
          { name: 'Parmesan cheese', quantity: 1, unit: 'cup', notes: 'Freshly grated' },
          { name: 'Black pepper', quantity: 2, unit: 'tsp', notes: 'Freshly ground' }
        ]
      },
      {
        name: 'Chicken Tikka Masala',
        description: 'Creamy tomato-based curry with marinated chicken pieces',
        prepTime: 30,
        cookTime: 40,
        servings: 6,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Indian',
        instructions: '1. Marinate chicken in yogurt and spices for 2 hours. 2. Grill or bake chicken until cooked. 3. Make sauce with tomatoes, cream, and spices. 4. Add chicken to sauce and simmer. 5. Serve with rice or naan bread.',
        imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
        source: 'global',
        ingredients: [
          { name: 'Chicken breast', quantity: 2, unit: 'lbs', notes: 'Cut into chunks' },
          { name: 'Yogurt', quantity: 1, unit: 'cup', notes: 'Plain, full-fat' },
          { name: 'Garam masala', quantity: 2, unit: 'tbsp', notes: null },
          { name: 'Tomato sauce', quantity: 28, unit: 'oz', notes: 'Canned' },
          { name: 'Heavy cream', quantity: 1, unit: 'cup', notes: null },
          { name: 'Onion', quantity: 1, unit: 'large', notes: 'Diced' },
          { name: 'Garlic', quantity: 4, unit: 'cloves', notes: 'Minced' }
        ]
      },
      {
        name: 'Classic Caesar Salad',
        description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
        prepTime: 15,
        cookTime: 0,
        servings: 4,
        difficulty: 'easy',
        category: 'lunch',
        cuisineType: 'American',
        instructions: '1. Wash and chop romaine lettuce. 2. Make dressing with anchovies, garlic, lemon, egg yolk, and olive oil. 3. Toss lettuce with dressing. 4. Top with croutons and parmesan cheese.',
        imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1',
        source: 'global',
        ingredients: [
          { name: 'Romaine lettuce', quantity: 2, unit: 'heads', notes: null },
          { name: 'Parmesan cheese', quantity: 0.5, unit: 'cup', notes: 'Shaved' },
          { name: 'Croutons', quantity: 1, unit: 'cup', notes: null },
          { name: 'Anchovies', quantity: 4, unit: 'fillets', notes: null },
          { name: 'Lemon juice', quantity: 2, unit: 'tbsp', notes: 'Fresh' },
          { name: 'Olive oil', quantity: 0.5, unit: 'cup', notes: 'Extra virgin' }
        ]
      },
      {
        name: 'Blueberry Pancakes',
        description: 'Fluffy buttermilk pancakes studded with fresh blueberries',
        prepTime: 10,
        cookTime: 15,
        servings: 4,
        difficulty: 'easy',
        category: 'breakfast',
        cuisineType: 'American',
        instructions: '1. Mix dry ingredients in a bowl. 2. Whisk together wet ingredients separately. 3. Combine wet and dry ingredients until just mixed. 4. Fold in blueberries. 5. Cook on griddle until bubbles form, then flip.',
        imageUrl: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93',
        source: 'global',
        ingredients: [
          { name: 'All-purpose flour', quantity: 2, unit: 'cups', notes: null },
          { name: 'Buttermilk', quantity: 2, unit: 'cups', notes: null },
          { name: 'Eggs', quantity: 2, unit: 'whole', notes: null },
          { name: 'Blueberries', quantity: 1, unit: 'cup', notes: 'Fresh' },
          { name: 'Baking powder', quantity: 2, unit: 'tsp', notes: null },
          { name: 'Sugar', quantity: 2, unit: 'tbsp', notes: null }
        ]
      },
      {
        name: 'Thai Pad Thai',
        description: 'Stir-fried rice noodles with shrimp, tofu, peanuts, and tamarind sauce',
        prepTime: 20,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Thai',
        instructions: '1. Soak rice noodles in warm water. 2. Prepare sauce with tamarind, fish sauce, and sugar. 3. Stir-fry shrimp and tofu. 4. Add noodles and sauce. 5. Toss with bean sprouts, eggs, and peanuts.',
        imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e',
        source: 'global',
        ingredients: [
          { name: 'Rice noodles', quantity: 8, unit: 'oz', notes: 'Wide' },
          { name: 'Shrimp', quantity: 0.5, unit: 'lb', notes: 'Peeled and deveined' },
          { name: 'Firm tofu', quantity: 8, unit: 'oz', notes: 'Cubed' },
          { name: 'Tamarind paste', quantity: 3, unit: 'tbsp', notes: null },
          { name: 'Fish sauce', quantity: 2, unit: 'tbsp', notes: null },
          { name: 'Peanuts', quantity: 0.25, unit: 'cup', notes: 'Crushed' },
          { name: 'Bean sprouts', quantity: 1, unit: 'cup', notes: null }
        ]
      },
      {
        name: 'Greek Moussaka',
        description: 'Layered eggplant and meat casserole with béchamel sauce',
        prepTime: 45,
        cookTime: 60,
        servings: 8,
        difficulty: 'hard',
        category: 'dinner',
        cuisineType: 'Greek',
        instructions: '1. Slice and salt eggplant, let drain. 2. Brown ground lamb with onions and spices. 3. Make béchamel sauce. 4. Layer eggplant, meat, and sauce in baking dish. 5. Bake until golden brown.',
        imageUrl: 'https://images.unsplash.com/photo-1607532941433-304659e8198a',
        source: 'global',
        ingredients: [
          { name: 'Eggplant', quantity: 2, unit: 'large', notes: 'Sliced' },
          { name: 'Ground lamb', quantity: 1.5, unit: 'lbs', notes: null },
          { name: 'Tomatoes', quantity: 28, unit: 'oz', notes: 'Canned crushed' },
          { name: 'Butter', quantity: 4, unit: 'tbsp', notes: 'For béchamel' },
          { name: 'Flour', quantity: 0.25, unit: 'cup', notes: 'For béchamel' },
          { name: 'Milk', quantity: 2, unit: 'cups', notes: 'Whole milk' }
        ]
      },
      {
        name: 'Chocolate Chip Cookies',
        description: 'Classic chewy cookies loaded with chocolate chips',
        prepTime: 15,
        cookTime: 12,
        servings: 24,
        difficulty: 'easy',
        category: 'dessert',
        cuisineType: 'American',
        instructions: '1. Cream butter and sugars together. 2. Beat in eggs and vanilla. 3. Mix in flour, baking soda, and salt. 4. Fold in chocolate chips. 5. Drop spoonfuls on baking sheet and bake at 375°F for 10-12 minutes.',
        imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
        source: 'global',
        ingredients: [
          { name: 'Butter', quantity: 1, unit: 'cup', notes: 'Softened' },
          { name: 'White sugar', quantity: 0.75, unit: 'cup', notes: null },
          { name: 'Brown sugar', quantity: 0.75, unit: 'cup', notes: 'Packed' },
          { name: 'Eggs', quantity: 2, unit: 'whole', notes: null },
          { name: 'All-purpose flour', quantity: 2.25, unit: 'cups', notes: null },
          { name: 'Chocolate chips', quantity: 2, unit: 'cups', notes: 'Semi-sweet' }
        ]
      },
      {
        name: 'Beef Tacos',
        description: 'Seasoned ground beef in corn tortillas with fresh toppings',
        prepTime: 10,
        cookTime: 15,
        servings: 6,
        difficulty: 'easy',
        category: 'dinner',
        cuisineType: 'Mexican',
        instructions: '1. Brown ground beef in a pan. 2. Add taco seasoning and water, simmer. 3. Warm tortillas. 4. Fill tortillas with beef. 5. Top with lettuce, cheese, tomatoes, and sour cream.',
        imageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
        source: 'global',
        ingredients: [
          { name: 'Ground beef', quantity: 1, unit: 'lb', notes: '80/20' },
          { name: 'Taco seasoning', quantity: 1, unit: 'packet', notes: null },
          { name: 'Corn tortillas', quantity: 12, unit: 'pieces', notes: null },
          { name: 'Lettuce', quantity: 2, unit: 'cups', notes: 'Shredded' },
          { name: 'Cheddar cheese', quantity: 1, unit: 'cup', notes: 'Shredded' },
          { name: 'Tomatoes', quantity: 2, unit: 'medium', notes: 'Diced' }
        ]
      },
      {
        name: 'Caprese Salad',
        description: 'Fresh mozzarella, tomatoes, and basil with balsamic glaze',
        prepTime: 10,
        cookTime: 0,
        servings: 4,
        difficulty: 'easy',
        category: 'lunch',
        cuisineType: 'Italian',
        instructions: '1. Slice tomatoes and mozzarella. 2. Arrange alternating slices on a platter. 3. Tuck basil leaves between slices. 4. Drizzle with olive oil and balsamic glaze. 5. Season with salt and pepper.',
        imageUrl: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804',
        source: 'global',
        ingredients: [
          { name: 'Tomatoes', quantity: 4, unit: 'large', notes: 'Ripe' },
          { name: 'Fresh mozzarella', quantity: 1, unit: 'lb', notes: null },
          { name: 'Fresh basil', quantity: 1, unit: 'bunch', notes: null },
          { name: 'Balsamic glaze', quantity: 2, unit: 'tbsp', notes: null },
          { name: 'Olive oil', quantity: 2, unit: 'tbsp', notes: 'Extra virgin' }
        ]
      },
      {
        name: 'French Onion Soup',
        description: 'Rich beef broth with caramelized onions, topped with cheese and bread',
        prepTime: 15,
        cookTime: 60,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'French',
        instructions: '1. Caramelize onions slowly in butter (45 min). 2. Add beef stock and thyme, simmer. 3. Toast bread slices. 4. Ladle soup into bowls, top with bread and gruyere cheese. 5. Broil until cheese melts.',
        imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        source: 'global',
        ingredients: [
          { name: 'Yellow onions', quantity: 4, unit: 'large', notes: 'Thinly sliced' },
          { name: 'Butter', quantity: 4, unit: 'tbsp', notes: null },
          { name: 'Beef stock', quantity: 6, unit: 'cups', notes: null },
          { name: 'French bread', quantity: 8, unit: 'slices', notes: null },
          { name: 'Gruyere cheese', quantity: 1.5, unit: 'cups', notes: 'Grated' }
        ]
      },
      {
        name: 'Avocado Toast',
        description: 'Toasted bread topped with mashed avocado and seasonings',
        prepTime: 5,
        cookTime: 5,
        servings: 2,
        difficulty: 'easy',
        category: 'breakfast',
        cuisineType: 'American',
        instructions: '1. Toast bread until golden. 2. Mash avocado with lime juice, salt, and pepper. 3. Spread avocado on toast. 4. Top with optional extras like eggs, tomatoes, or red pepper flakes.',
        imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d',
        source: 'global',
        ingredients: [
          { name: 'Bread', quantity: 4, unit: 'slices', notes: 'Whole grain or sourdough' },
          { name: 'Avocados', quantity: 2, unit: 'whole', notes: 'Ripe' },
          { name: 'Lime juice', quantity: 1, unit: 'tbsp', notes: 'Fresh' },
          { name: 'Red pepper flakes', quantity: 0.25, unit: 'tsp', notes: 'Optional' }
        ]
      },
      {
        name: 'Chicken Fried Rice',
        description: 'Quick stir-fried rice with chicken, vegetables, and soy sauce',
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        difficulty: 'easy',
        category: 'dinner',
        cuisineType: 'Chinese',
        instructions: '1. Cook rice and let cool (use day-old rice if possible). 2. Stir-fry chicken until cooked. 3. Add vegetables and cook. 4. Add rice and soy sauce, toss well. 5. Push rice to side, scramble eggs, then mix in.',
        imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
        source: 'global',
        ingredients: [
          { name: 'White rice', quantity: 3, unit: 'cups', notes: 'Cooked and cooled' },
          { name: 'Chicken breast', quantity: 1, unit: 'lb', notes: 'Diced' },
          { name: 'Mixed vegetables', quantity: 2, unit: 'cups', notes: 'Peas, carrots, corn' },
          { name: 'Eggs', quantity: 2, unit: 'whole', notes: 'Beaten' },
          { name: 'Soy sauce', quantity: 3, unit: 'tbsp', notes: null },
          { name: 'Garlic', quantity: 2, unit: 'cloves', notes: 'Minced' }
        ]
      },
      {
        name: 'Hummus and Pita',
        description: 'Creamy chickpea dip with warm pita bread',
        prepTime: 10,
        cookTime: 0,
        servings: 6,
        difficulty: 'easy',
        category: 'snack',
        cuisineType: 'Middle Eastern',
        instructions: '1. Blend chickpeas, tahini, lemon juice, and garlic until smooth. 2. Drizzle in olive oil while blending. 3. Season with salt and cumin. 4. Serve with warm pita bread and olive oil drizzle.',
        imageUrl: 'https://images.unsplash.com/photo-1571858636052-0a6d0d6c3d8d',
        source: 'global',
        ingredients: [
          { name: 'Chickpeas', quantity: 15, unit: 'oz', notes: 'Canned, drained' },
          { name: 'Tahini', quantity: 0.25, unit: 'cup', notes: null },
          { name: 'Lemon juice', quantity: 3, unit: 'tbsp', notes: 'Fresh' },
          { name: 'Garlic', quantity: 2, unit: 'cloves', notes: null },
          { name: 'Pita bread', quantity: 6, unit: 'pieces', notes: null }
        ]
      },
      {
        name: 'Beef Stroganoff',
        description: 'Tender beef strips in creamy mushroom sauce over egg noodles',
        prepTime: 15,
        cookTime: 30,
        servings: 6,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Russian',
        instructions: '1. Sauté beef strips until browned, set aside. 2. Cook mushrooms and onions in same pan. 3. Add beef broth and simmer. 4. Stir in sour cream. 5. Return beef to pan and serve over egg noodles.',
        imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976',
        source: 'global',
        ingredients: [
          { name: 'Beef sirloin', quantity: 1.5, unit: 'lbs', notes: 'Cut into strips' },
          { name: 'Mushrooms', quantity: 8, unit: 'oz', notes: 'Sliced' },
          { name: 'Onion', quantity: 1, unit: 'medium', notes: 'Diced' },
          { name: 'Beef broth', quantity: 2, unit: 'cups', notes: null },
          { name: 'Sour cream', quantity: 1, unit: 'cup', notes: null },
          { name: 'Egg noodles', quantity: 12, unit: 'oz', notes: null }
        ]
      },
      {
        name: 'Banana Bread',
        description: 'Moist, sweet bread made with overripe bananas',
        prepTime: 15,
        cookTime: 60,
        servings: 10,
        difficulty: 'easy',
        category: 'dessert',
        cuisineType: 'American',
        instructions: '1. Mash ripe bananas in a bowl. 2. Mix in melted butter, sugar, egg, and vanilla. 3. Add flour, baking soda, and salt. 4. Pour into greased loaf pan. 5. Bake at 350°F for 60 minutes.',
        imageUrl: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62',
        source: 'global',
        ingredients: [
          { name: 'Ripe bananas', quantity: 3, unit: 'whole', notes: 'Mashed' },
          { name: 'Butter', quantity: 0.33, unit: 'cup', notes: 'Melted' },
          { name: 'Sugar', quantity: 0.75, unit: 'cup', notes: null },
          { name: 'Egg', quantity: 1, unit: 'whole', notes: 'Beaten' },
          { name: 'All-purpose flour', quantity: 1.5, unit: 'cups', notes: null },
          { name: 'Baking soda', quantity: 1, unit: 'tsp', notes: null }
        ]
      },
      {
        name: 'Vegetable Stir Fry',
        description: 'Colorful mix of vegetables in savory Asian sauce',
        prepTime: 15,
        cookTime: 10,
        servings: 4,
        difficulty: 'easy',
        category: 'dinner',
        cuisineType: 'Chinese',
        instructions: '1. Prep all vegetables (broccoli, peppers, carrots, snap peas). 2. Heat wok with oil over high heat. 3. Stir-fry vegetables in batches. 4. Add sauce (soy sauce, ginger, garlic). 5. Serve over rice.',
        imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        source: 'global',
        ingredients: [
          { name: 'Broccoli', quantity: 2, unit: 'cups', notes: 'Florets' },
          { name: 'Bell peppers', quantity: 2, unit: 'whole', notes: 'Mixed colors, sliced' },
          { name: 'Carrots', quantity: 2, unit: 'medium', notes: 'Julienned' },
          { name: 'Snap peas', quantity: 1, unit: 'cup', notes: null },
          { name: 'Soy sauce', quantity: 3, unit: 'tbsp', notes: null },
          { name: 'Ginger', quantity: 1, unit: 'tbsp', notes: 'Fresh, minced' }
        ]
      },
      {
        name: 'Eggs Benedict',
        description: 'Poached eggs on English muffins with Canadian bacon and hollandaise',
        prepTime: 20,
        cookTime: 15,
        servings: 4,
        difficulty: 'hard',
        category: 'breakfast',
        cuisineType: 'American',
        instructions: '1. Make hollandaise sauce with egg yolks, butter, and lemon. 2. Toast English muffins. 3. Cook Canadian bacon. 4. Poach eggs. 5. Assemble with muffin, bacon, egg, and sauce.',
        imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7',
        source: 'global',
        ingredients: [
          { name: 'Eggs', quantity: 8, unit: 'whole', notes: 'Fresh' },
          { name: 'English muffins', quantity: 4, unit: 'whole', notes: 'Split' },
          { name: 'Canadian bacon', quantity: 8, unit: 'slices', notes: null },
          { name: 'Butter', quantity: 0.5, unit: 'cup', notes: 'For hollandaise' },
          { name: 'Lemon juice', quantity: 1, unit: 'tbsp', notes: 'Fresh' }
        ]
      },
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        prepTime: 90,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Italian',
        instructions: '1. Make pizza dough and let rise. 2. Roll out dough into rounds. 3. Spread with tomato sauce. 4. Add mozzarella cheese. 5. Bake at 500°F until bubbly. 6. Top with fresh basil.',
        imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
        source: 'global',
        ingredients: [
          { name: 'Pizza dough', quantity: 1, unit: 'lb', notes: 'Homemade or store-bought' },
          { name: 'Tomato sauce', quantity: 1, unit: 'cup', notes: 'Pizza sauce' },
          { name: 'Fresh mozzarella', quantity: 8, unit: 'oz', notes: 'Sliced' },
          { name: 'Fresh basil', quantity: 0.5, unit: 'cup', notes: 'Leaves' },
          { name: 'Olive oil', quantity: 2, unit: 'tbsp', notes: null }
        ]
      },
      {
        name: 'Trail Mix',
        description: 'Healthy snack mix of nuts, dried fruits, and chocolate',
        prepTime: 5,
        cookTime: 0,
        servings: 8,
        difficulty: 'easy',
        category: 'snack',
        cuisineType: 'American',
        instructions: '1. Combine almonds, cashews, and peanuts in a bowl. 2. Add dried cranberries and raisins. 3. Mix in chocolate chips or M&Ms. 4. Portion into bags or containers for easy snacking.',
        imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32',
        source: 'global',
        ingredients: [
          { name: 'Almonds', quantity: 1, unit: 'cup', notes: 'Raw or roasted' },
          { name: 'Cashews', quantity: 1, unit: 'cup', notes: null },
          { name: 'Dried cranberries', quantity: 0.5, unit: 'cup', notes: null },
          { name: 'Chocolate chips', quantity: 0.5, unit: 'cup', notes: null },
          { name: 'Raisins', quantity: 0.5, unit: 'cup', notes: null }
        ]
      },
      {
        name: 'Beef and Broccoli',
        description: 'Tender beef and crisp broccoli in savory brown sauce',
        prepTime: 20,
        cookTime: 15,
        servings: 4,
        difficulty: 'medium',
        category: 'dinner',
        cuisineType: 'Chinese',
        instructions: '1. Slice beef thinly and marinate in soy sauce. 2. Blanch broccoli. 3. Stir-fry beef over high heat until browned. 4. Add broccoli and sauce (soy, oyster sauce, garlic). 5. Serve over rice.',
        imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143',
        source: 'global',
        ingredients: [
          { name: 'Beef sirloin', quantity: 1, unit: 'lb', notes: 'Thinly sliced' },
          { name: 'Broccoli', quantity: 3, unit: 'cups', notes: 'Florets' },
          { name: 'Soy sauce', quantity: 0.25, unit: 'cup', notes: null },
          { name: 'Oyster sauce', quantity: 2, unit: 'tbsp', notes: null },
          { name: 'Garlic', quantity: 3, unit: 'cloves', notes: 'Minced' },
          { name: 'Cornstarch', quantity: 1, unit: 'tbsp', notes: 'For thickening' }
        ]
      }
    ];

    // Create meals and their ingredients
    for (const mealData of meals) {
      const { ingredients, ...mealInfo } = mealData;
      
      console.log(`Creating meal: ${mealInfo.name}`);
      const meal = await SearchMeal.create(mealInfo);
      
      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await SearchIngredient.create({
            ...ingredient,
            searchMealId: meal.id
          });
        }
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`Created ${meals.length} meals with their ingredients.`);
    
    // Close database connection
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();