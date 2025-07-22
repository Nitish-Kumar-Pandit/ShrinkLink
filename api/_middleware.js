// Shared middleware for Vercel serverless functions
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from '../BACKEND/src/config/mongo.config.js';

// Initialize database connection
let isConnected = false;

export const initializeDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// CORS configuration
export const corsMiddleware = cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    process.env.FRONTEND_URL || 'https://your-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
});

// Cookie parser middleware
export const cookieMiddleware = cookieParser();

// Helper function to run middleware
export const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Common handler wrapper
export const withMiddleware = (handler) => {
  return async (req, res) => {
    try {
      // Initialize database
      await initializeDatabase();
      
      // Run CORS middleware
      await runMiddleware(req, res, corsMiddleware);
      
      // Run cookie middleware
      await runMiddleware(req, res, cookieMiddleware);
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      // Call the actual handler
      return await handler(req, res);
    } catch (error) {
      console.error('Middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};
