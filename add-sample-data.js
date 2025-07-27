#!/usr/bin/env node

// Simple script to add a few sample URLs for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { nanoid } from 'nanoid';

// Load environment variables
dotenv.config();

// Import models
import UrlSchema from './BACKEND/src/models/shorturl.model.js';

console.log('🌱 Adding Sample Data');
console.log('====================\n');

async function addSampleData() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully\n');

    // Create a few sample URLs
    const sampleUrls = [
      {
        short_url: 'test1',
        full_url: 'https://github.com',
        is_custom: true
      },
      {
        short_url: 'test2',
        full_url: 'https://google.com',
        is_custom: true
      },
      {
        short_url: nanoid(6),
        full_url: 'https://stackoverflow.com',
        is_custom: false
      }
    ];

    console.log('🔗 Creating sample URLs...');
    
    for (const urlData of sampleUrls) {
      const url = new UrlSchema({
        ...urlData,
        clicks: 0,
        clientIP: '127.0.0.1',
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      });
      
      await url.save();
      console.log(`   ✅ ${urlData.short_url} → ${urlData.full_url}`);
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n🧪 Test these URLs:');
    console.log('   - http://localhost:3000/test1');
    console.log('   - http://localhost:3000/test2');
    
    const randomUrl = await UrlSchema.findOne({ is_custom: false });
    if (randomUrl) {
      console.log(`   - http://localhost:3000/${randomUrl.short_url}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

addSampleData();
