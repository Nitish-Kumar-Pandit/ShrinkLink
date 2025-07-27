#!/usr/bin/env node

// Script to initialize a fresh database with sample data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Import models
import UrlSchema from './BACKEND/src/models/shorturl.model.js';
import UserSchema from './BACKEND/src/models/user.model.js';

console.log('🌱 Fresh Database Initialization Script');
console.log('=====================================\n');

async function initializeFreshDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully\n');

    // Check if database is empty
    const urlCount = await UrlSchema.countDocuments();
    const userCount = await UserSchema.countDocuments();
    
    if (urlCount > 0 || userCount > 0) {
      console.log('⚠️  Database is not empty!');
      console.log(`   - URLs: ${urlCount}`);
      console.log(`   - Users: ${userCount}`);
      console.log('');
      console.log('🧹 Run clear-database.js first to clear existing data');
      process.exit(1);
    }

    console.log('✨ Database is empty - proceeding with initialization...\n');

    // Create sample URLs
    console.log('🔗 Creating sample shortened URLs...');
    
    const sampleUrls = [
      {
        short_id: 'github',
        full_url: 'https://github.com',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        is_custom: true
      },
      {
        short_id: 'google',
        full_url: 'https://google.com',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        is_custom: true
      },
      {
        short_id: nanoid(6),
        full_url: 'https://stackoverflow.com',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_custom: false
      },
      {
        short_id: nanoid(6),
        full_url: 'https://developer.mozilla.org',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        is_custom: false
      },
      {
        short_id: nanoid(6),
        full_url: 'https://nodejs.org',
        expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        is_custom: false
      }
    ];

    for (const urlData of sampleUrls) {
      const url = new UrlSchema({
        ...urlData,
        created_at: new Date(),
        click_count: Math.floor(Math.random() * 100), // Random click count
        is_favorite: Math.random() > 0.7, // 30% chance of being favorite
        created_by_ip: '127.0.0.1'
      });
      
      await url.save();
      console.log(`   ✅ Created: ${urlData.short_id} → ${urlData.full_url}`);
    }

    // Create sample user
    console.log('\n👤 Creating sample user...');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    const sampleUser = new UserSchema({
      name: 'Demo User',
      email: 'demo@shrinklink.com',
      password: hashedPassword,
      created_at: new Date(),
      is_verified: true
    });
    
    await sampleUser.save();
    console.log('   ✅ Created demo user: demo@shrinklink.com (password: password123)');

    // Create user-specific URLs
    console.log('\n🔗 Creating user-specific URLs...');
    
    const userUrls = [
      {
        short_id: 'mysite',
        full_url: 'https://mywebsite.com',
        user_id: sampleUser._id,
        is_custom: true
      },
      {
        short_id: nanoid(6),
        full_url: 'https://react.dev',
        user_id: sampleUser._id,
        is_custom: false
      }
    ];

    for (const urlData of userUrls) {
      const url = new UrlSchema({
        ...urlData,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        click_count: Math.floor(Math.random() * 50),
        is_favorite: Math.random() > 0.5,
        created_by_ip: '127.0.0.1'
      });
      
      await url.save();
      console.log(`   ✅ Created user URL: ${urlData.short_id} → ${urlData.full_url}`);
    }

    // Summary
    console.log('\n🎉 Fresh database initialized successfully!');
    console.log('📊 Summary:');
    
    const finalUrlCount = await UrlSchema.countDocuments();
    const finalUserCount = await UserSchema.countDocuments();
    
    console.log(`   - Total URLs: ${finalUrlCount}`);
    console.log(`   - Total Users: ${finalUserCount}`);
    console.log('');
    
    console.log('🧪 Test URLs you can use:');
    const allUrls = await UrlSchema.find({}, 'short_id full_url').limit(10);
    for (const url of allUrls) {
      console.log(`   - http://localhost:3000/${url.short_id} → ${url.full_url}`);
    }
    
    console.log('\n👤 Test User Credentials:');
    console.log('   - Email: demo@shrinklink.com');
    console.log('   - Password: password123');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

console.log('🚀 Starting fresh database initialization...\n');
initializeFreshDatabase();
