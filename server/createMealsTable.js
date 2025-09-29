const { sequelize } = require('./models');
require('dotenv').config();

async function createMealsTable() {
  try {
    console.log('🔄 Creating Meals table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "Meals" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "prepTime" INTEGER,
        "cookTime" INTEGER,
        "servings" INTEGER NOT NULL DEFAULT 1,
        "difficulty" VARCHAR(255) CHECK ("difficulty" IN ('easy', 'medium', 'hard')),
        "category" VARCHAR(255) NOT NULL DEFAULT 'dinner' CHECK ("category" IN ('breakfast', 'lunch', 'dinner', 'snack', 'dessert')),
        "instructions" TEXT,
        "imageUrl" VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ Meals table created successfully');
    
    // Also create the SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);
    
    // Mark our migration as completed
    const migrationName = '20240115000000-create-meal.js'; // Use actual migration filename
    await sequelize.query(`
      INSERT INTO "SequelizeMeta" ("name") 
      VALUES ('${migrationName}') 
      ON CONFLICT ("name") DO NOTHING;
    `);
    
    console.log('✅ Migration marked as completed');
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

createMealsTable();