import express from 'express';
import { nanoid } from 'nanoid';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import routes and controllers
import short_url from './src/routes/short_url.route.js';
import auth_routes from './src/routes/auth.route.js';
import { redirectFromShortUrl, getUserUrlsController, getUserStatsController } from './src/controller/short_url.controller.js';
import { attachUser } from './src/utils/attachUser.js';
import connectDB from './src/config/mongo.config.js';

const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to database first
connectDB();

// CORS configuration for both development and production
const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    // Add your production frontend URLs here
].filter(Boolean); // Remove undefined values

console.log('🔧 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, curl)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            console.log('✅ Allowed origins:', allowedOrigins);
            // In production, be more permissive for debugging
            if (process.env.NODE_ENV === 'production') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Trust proxy for proper IP detection (important for Render)
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('Origin')} - IP: ${req.ip}`);
    next();
});

// Attach user middleware for authentication
app.use(attachUser);



 
// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});





// API Routes
app.use("/api/auth", auth_routes);
app.use("/api/create", short_url);

// Protected routes (require authentication)
app.get("/api/urls", attachUser, getUserUrlsController);
app.get("/api/stats", attachUser, getUserStatsController);

// API endpoint for frontend redirects
app.get("/api/redirect/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        if (!shortCode) {
            return res.status(400).json({
                success: false,
                message: "Short code is required"
            });
        }

        console.log(`🔍 API redirect request for: ${shortCode}`);

        // Import the DAO function directly
        const { getShortUrl } = await import('./src/dao/short_url.js');
        const url = await getShortUrl(shortCode);

        if (!url || !url.full_url) {
            console.log(`❌ Short code not found: ${shortCode}`);
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        // Check if URL has expired
        if (url.expiresAt && new Date() > url.expiresAt) {
            console.log(`⏰ URL expired: ${shortCode}`);
            return res.status(410).json({
                success: false,
                message: "This short URL has expired"
            });
        }

        console.log(`✅ Returning URL for ${shortCode}: ${url.full_url}`);

        res.status(200).json({
            success: true,
            url: url.full_url,
            clicks: url.clicks
        });
    } catch (error) {
        console.error('❌ API redirect error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});



// Short URL redirect route - handle direct short URL access
app.get("/:shortCode", async (req, res) => {
    try {
        const { shortCode } = req.params;

        console.log(`🔍 Direct redirect request for: ${shortCode}`);

        // Skip known API routes and health check
        if (shortCode === 'health' || shortCode.startsWith('api')) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }

        // Sanitize input - trim whitespace and handle URL encoding
        const sanitizedId = decodeURIComponent(shortCode.trim());

        // Import the DAO function directly
        const { getShortUrl } = await import('./src/dao/short_url.js');
        const url = await getShortUrl(sanitizedId);

        if (!url || !url.full_url) {
            console.log(`❌ Short URL not found: ${shortCode}`);
            return res.status(404).json({
                success: false,
                message: "Short URL not found",
                shortCode: shortCode
            });
        }

        // Check if URL has expired
        if (url.expiresAt && new Date() > url.expiresAt) {
            console.log(`⏰ Short URL expired: ${shortCode}`);
            return res.status(410).json({
                success: false,
                message: "This short URL has expired",
                shortCode: shortCode
            });
        }

        console.log(`✅ Redirecting ${shortCode} to: ${url.full_url}`);

        // Ensure the URL has proper protocol
        let redirectUrl = url.full_url;
        if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
            redirectUrl = 'https://' + redirectUrl;
        }

        // Perform the redirect with 301 status (permanent redirect)
        return res.redirect(301, redirectUrl);

    } catch (error) {
        console.error('❌ Redirect error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});



// Global error handler
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404 for unknown routes (must be last)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

const PORT = process.env.PORT || 5000;

// Set APP_URL for production if not set
if (process.env.NODE_ENV === 'production' && !process.env.APP_URL) {
    process.env.APP_URL = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'localhost:' + PORT}`;
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ShrinkLink Backend API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Backend URL: ${process.env.APP_URL || 'http://localhost:' + PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not configured'}`);
    console.log(`🗄️  MongoDB: ${process.env.MONGO_URI ? 'Configured' : 'Not configured'}`);
});