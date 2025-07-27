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
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.APP_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
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

  // Add extra debugging for API calls
  if (req.path.startsWith('/api/')) {
    console.log(`🔍 API Call: ${req.method} ${req.path} - Body:`, req.body ? JSON.stringify(req.body).substring(0, 100) : 'none');
  }

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
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
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
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: !!process.env.MONGO_URI,
    appUrl: process.env.APP_URL || 'not set'
  });
});

// Debug endpoint for production troubleshooting
app.get('/api/debug/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    console.log('🔍 Debug request for short code:', shortCode);

    // Import the DAO function
    const { getShortUrl } = await import('./BACKEND/src/dao/short_url.js');
    const url = await getShortUrl(shortCode);

    res.json({
      success: true,
      shortCode: shortCode,
      found: !!url,
      url: url ? {
        full_url: url.full_url,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt
      } : null,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      shortCode: shortCode,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
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

// Short URL redirection route - handles /:shortCode
app.get('/:shortCode', async (req, res, next) => {
  const { shortCode } = req.params;

  // Skip known frontend routes
  const knownFrontendRoutes = (process.env.FRONTEND_ROUTES || 'auth,register,dashboard,analytics-demo,test-redirect').split(',');
  if (knownFrontendRoutes.includes(shortCode.toLowerCase())) {
    console.log('🔍 Frontend route detected:', shortCode);
    return next(); // Pass to catch-all route
  }

  // Skip files with extensions
  if (shortCode.includes('.')) {
    console.log('🔍 File request detected:', shortCode);
    return next();
  }

  console.log('🔍 Short URL route hit:', shortCode);
  console.log('🔍 Environment:', process.env.NODE_ENV);
  console.log('🔍 MongoDB URI exists:', !!process.env.MONGO_URI);

  try {
    // Import DAO function
    const { getShortUrl } = await import('./BACKEND/src/dao/short_url.js');
    console.log('🔍 DAO imported successfully');

    // Query database
    const url = await getShortUrl(shortCode);
    console.log('🔍 Database query result:', url ? 'FOUND' : 'NOT FOUND');
    if (url) {
      console.log('🔍 URL details:', {
        full_url: url.full_url,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
        clicks: url.clicks
      });
    }

    if (url && url.full_url) {
      // Check expiration
      if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
        console.log('⏰ Short URL expired:', shortCode);
        const redirectUrl = process.env.FRONTEND_URL || process.env.APP_URL || '/';
        return res.redirect(`${redirectUrl}?error=expired`);
      }

      console.log('✅ Redirecting', shortCode, 'to:', url.full_url);
      return res.redirect(url.full_url);
    } else {
      console.log('❌ Short URL not found:', shortCode);
      // Return 404 for non-existent short URLs
      return res.status(404).json({
        success: false,
        message: 'Short URL not found',
        shortCode: shortCode
      });
    }
  } catch (error) {
    console.error('❌ Error during redirection:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      shortCode: shortCode
    });
  }
});

// Serve static files from React build
const frontendDistPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, 'FRONTEND/dist');
app.use(express.static(frontendDistPath));

// Handle React routing - serve index.html for all other routes
app.get('*', (req, res) => {
  console.log('🔍 Catch-all route hit:', req.path);
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

app.listen(PORT, () => {
  const serverUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  console.log(`🚀 ShrinkLink server running on port ${PORT}`);
  console.log(`📱 Frontend: ${serverUrl}`);
  console.log(`🔗 API: ${serverUrl}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: ${process.env.MONGO_URI ? 'Connected' : 'Not configured'}`);
});
