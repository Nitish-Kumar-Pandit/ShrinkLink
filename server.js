import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins in production
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import API routes
import authRoutes from './BACKEND/src/routes/auth.route.js';
import shortUrlRoutes from './BACKEND/src/routes/short_url.route.js';
import { redirectFromShortUrl, getUserUrlsController, getUserStatsController } from './BACKEND/src/controller/short_url.controller.js';
import { attachUser } from './BACKEND/src/utils/attachUser.js';
import connectDB from './BACKEND/src/config/mongo.config.js';

// Connect to database
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/create', shortUrlRoutes);

// User-specific routes (require authentication)
app.get('/api/urls', attachUser, getUserUrlsController);
app.get('/api/stats', attachUser, getUserStatsController);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ShrinkLink API is healthy!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'FRONTEND/dist')));

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Skip API routes and short URL redirects
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  
  // Check if it's a short URL redirect (single path segment, no file extension)
  const pathSegments = req.path.split('/').filter(Boolean);
  if (pathSegments.length === 1 && !pathSegments[0].includes('.')) {
    // This might be a short URL, try to redirect
    return redirectFromShortUrl(req, res);
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'FRONTEND/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 ShrinkLink server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});
