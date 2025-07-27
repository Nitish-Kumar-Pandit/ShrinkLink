#!/usr/bin/env node

// Script to create a user with specific ID to fix authentication
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Import models
import UserSchema from './BACKEND/src/models/user.model.js';

console.log('👤 Creating User for Authentication Fix');
console.log('=====================================\n');

async function createUser() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully\n');

    // Create user with the specific ID from the logs
    const userId = new mongoose.Types.ObjectId('68850a80815f89393cf4b108');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = new UserSchema({
      _id: userId,
      username: 'Demo User',
      email: 'dd@gmail.com', // From the logs
      password: hashedPassword,
      createdAt: new Date(),
      isVerified: true
    });
    
    await user.save();
    console.log('✅ User created successfully!');
    console.log('📧 Email: dd@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🆔 User ID:', userId.toString());

  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ User already exists - that\'s fine!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

createUser();
