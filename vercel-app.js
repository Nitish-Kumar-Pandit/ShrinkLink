// Vercel serverless wrapper for Express.js app
import express from 'express';
import { nanoid } from 'nanoid';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import your routes and controllers
import short_url from './BACKEND/src/routes/short_url.route.js';
import UrlSchema from './BACKEND/src/models/shorturl.model.js';
import connectDB from './BACKEND/src/config/mongo.config.js';
import auth_routes from './BACKEND/src/routes/auth.route.js';
import { redirectFromShortUrl, getUserUrlsController, getUserStatsController } from './BACKEND/src/controller/short_url.controller.js';
import { attachUser } from './BACKEND/src/utils/attachUser.js';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for production
app.use(cors({
    origin: true, // Allow all origins in production
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Normalize short URL paths to lowercase for case-insensitive matching
app.use((req, res, next) => {
    // Only normalize single-segment paths that look like short URLs (not API routes)
    if (req.path.match(/^\/[a-zA-Z0-9_-]{3,10}$/) && !req.path.startsWith('/api/') && !req.path.startsWith('/health')) {
        req.url = req.url.toLowerCase();
    }
    next();
});

// Trust proxy for proper IP detection
app.set('trust proxy', true);

app.use(cookieParser());
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

// Test route
app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is working!",
        timestamp: new Date().toISOString(),
        environment: {
            NODE_ENV: process.env.NODE_ENV || 'not set',
            MONGO_URI: process.env.MONGO_URI ? 'set' : 'not set',
            JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set'
        }
    });
});

// Use your existing routes
app.use('/api', short_url);
app.use('/api/auth', auth_routes);

// Handle short URL redirects
app.get('/:shortCode', async (req, res) => {
    try {
        await connectDB();
        
        const { shortCode } = req.params;
        console.log(`🔍 Looking for short code: ${shortCode}`);
        
        // Find URL by short code (case-insensitive)
        const url = await UrlSchema.findOne({ 
            short_code: { $regex: new RegExp(`^${shortCode}$`, 'i') }
        });
        
        if (!url) {
            console.log(`❌ Short code not found: ${shortCode}`);
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }
        
        // Check if URL has expired
        if (url.expires_at && new Date() > url.expires_at) {
            console.log(`⏰ URL expired: ${shortCode}`);
            return res.status(410).json({
                success: false,
                message: "This short URL has expired"
            });
        }
        
        // Increment click count
        url.clicks += 1;
        await url.save();
        
        console.log(`✅ Redirecting ${shortCode} to ${url.full_url}`);
        res.redirect(url.full_url);
    } catch (error) {
        console.error('❌ Redirect error:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Connect to database
connectDB();

export default app;
