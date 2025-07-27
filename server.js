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
  origin: [
    'https://sl.nitishh.in',
    'https://shrinklink-rsha.onrender.com',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Debug middleware for production
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')} - User-Agent: ${req.get('User-Agent')?.substring(0, 50)}`);
  next();
});

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

// API endpoint for redirect (used by frontend for AJAX calls)
app.get('/api/redirect/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    console.log('🔍 API redirect request for:', shortCode);

    // Import the DAO function directly
    const { getShortUrl } = await import('./BACKEND/src/dao/short_url.js');
    const url = await getShortUrl(shortCode);

    if (!url || !url.full_url) {
      console.log('❌ Short URL not found:', shortCode);
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    // Check if URL is expired
    if (url.expires_at && new Date() > new Date(url.expires_at)) {
      console.log('⏰ Short URL expired:', shortCode);
      return res.status(410).json({
        success: false,
        message: "Short URL has expired"
      });
    }

    console.log('✅ Returning URL for', shortCode + ':', url.full_url);
    res.json({
      success: true,
      url: url.full_url
    });
  } catch (error) {
    console.error('❌ API redirect error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ShrinkLink API is healthy!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global error handler for API routes
app.use('/api/*', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Dedicated route for short URL redirection
app.get('/:shortCode', async (req, res, next) => {
  const { shortCode } = req.params;

  // Basic validation to avoid treating frontend routes as short codes
  const knownFrontendRoutes = ['auth', 'register', 'dashboard', 'analytics-demo', 'test-redirect'];
  if (knownFrontendRoutes.includes(shortCode.toLowerCase())) {
    return next(); // Pass to the next handler (React app)
  }
  
  // Avoid favicon requests
  if (shortCode === 'favicon.ico') {
    return res.status(204).send();
  }

  console.log('🔍 Attempting to redirect for short code:', shortCode);

  try {
    const { getShortUrl } = await import('./BACKEND/src/dao/short_url.js');
    const url = await getShortUrl(shortCode);

    if (url && url.full_url) {
      // Check for expiration
      if (url.expires_at && new Date() > new Date(url.expires_at)) {
        console.log('⏰ Short URL expired:', shortCode);
        // Redirect to an error page on the frontend
        return res.redirect('/?error=expired');
      }
      
      console.log('✅ Redirecting', shortCode, 'to:', url.full_url);
      return res.redirect(url.full_url);
    } else {
      console.log('❌ Short URL not found:', shortCode);
      // Explicitly pass to the next handler if not found
      return next();
    }
  } catch (error) {
    console.error('❌ Error during redirection:', error);
    return next(error); // Pass error to the global error handler
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'FRONTEND/dist')));

// Handle React routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'FRONTEND/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 ShrinkLink server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});
