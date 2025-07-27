#!/usr/bin/env node

// Script to clear the database and start fresh
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models
import UrlSchema from './BACKEND/src/models/shorturl.model.js';
import UserSchema from './BACKEND/src/models/user.model.js';

console.log('🗑️  Database Cleanup Script');
console.log('==========================\n');

async function clearDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log('🗄️  Database Name:', dbName);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📋 Found collections:', collections.map(c => c.name).join(', '));
    console.log('');

    // Clear each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🧹 Clearing collection: ${collectionName}`);
      
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`   ✅ Deleted ${result.deletedCount} documents`);
    }

    console.log('\n🎉 Database cleared successfully!');
    console.log('📊 Summary:');
    console.log(`   - Database: ${dbName}`);
    console.log(`   - Collections cleared: ${collections.length}`);
    console.log('   - All data removed');

    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents remaining`);
    }

    console.log('\n✨ Database is now fresh and ready for new data!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete ALL data in the database!');
console.log('📋 This includes:');
console.log('   - All shortened URLs');
console.log('   - All user accounts');
console.log('   - All analytics data');
console.log('   - All favorites and settings');
console.log('');

// Check for confirmation argument
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
  console.log('🛡️  Safety Check: To proceed, run this command with --confirm flag:');
  console.log('   node clear-database.js --confirm');
  console.log('');
  process.exit(0);
}

console.log('🚀 Starting database cleanup...\n');
clearDatabase();
