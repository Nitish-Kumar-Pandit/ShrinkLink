import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Database connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;

  // Check if MONGO_URI is available
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set');
    throw new Error('Database configuration missing. Please set MONGO_URI environment variable.');
  }

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });
    isConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Full error:', error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

// Helper function to extract token from cookies
function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  return cookies.accessToken;
}

export default async function handler(req, res) {
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact administrator."
      });
    }

    // Get token from cookies
    const token = getTokenFromCookies(req.headers.cookie);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to get user information",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
