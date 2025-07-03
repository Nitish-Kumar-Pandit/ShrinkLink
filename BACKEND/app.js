import express from 'express';
const app = express();
import { nanoid } from 'nanoid';
import dotenv from "dotenv";
import short_url from './src/routes/short_url.route.js';
import UrlSchema from './src/models/shorturl.model.js';
import connectDB from './src/config/mongo.config.js';
import auth_routes from './src/routes/auth.route.js';
import { redirectFromShortUrl, getUserUrlsController } from './src/controller/short_url.controller.js';
dotenv.config("./.env");
import cors from 'cors';
import { attachUser } from './src/utils/attachUser.js';
import cookieParser from 'cookie-parser';

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware for all requests
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

// Normalize short URL paths to lowercase for case-insensitive matching
app.use((req, res, next) => {
    const originalPath = req.path;
    const originalUrl = req.url;

    // Only normalize single-segment paths that look like short URLs (not API routes)
    if (req.path.match(/^\/[a-zA-Z0-9_-]{3,10}$/) && !req.path.startsWith('/api/') && !req.path.startsWith('/test') && !req.path.startsWith('/debug') && !req.path.startsWith('/health')) {
        req.url = req.url.toLowerCase();
        console.log(`🔄 Normalized URL: ${originalUrl} → ${req.url}`);
    }
    next();
});

// Trust proxy for proper IP detection
app.set('trust proxy', true);

// Debug middleware
app.use((req, res, next) => {
    console.log(`🌐 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
});

app.use(cookieParser());
app.use(attachUser);




 
// Test route
app.get("/", (req, res) => {
    res.json({ message: "Server is working!" });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Debug route to check database
app.get("/debug/urls", async (req, res) => {
    try {
        console.log('🔍 Debug endpoint called');
        const urls = await UrlSchema.find({}).limit(10);
        console.log('📊 Found URLs:', urls.length);
        urls.forEach(url => {
            console.log(`📄 URL: ${url.short_url} -> ${url.full_url}`);
        });
        res.json({ count: urls.length, urls });
    } catch (error) {
        console.error('❌ Debug endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Debug route to clear all URLs (for testing)
app.delete("/debug/clear", async (req, res) => {
    try {
        console.log('🗑️ Clearing all URLs from database');
        const result = await UrlSchema.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} URLs`);
        res.json({
            message: 'All URLs cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Clear endpoint error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Simple test route
app.get("/test", (req, res) => {
    console.log('🧪 Test endpoint called');
    res.json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

// Test POST route
app.post("/test-post", (req, res) => {
    console.log('🧪 Test POST endpoint called with body:', req.body);
    res.json({ message: "POST is working!", body: req.body, timestamp: new Date().toISOString() });
});

// Test nanoid generation
app.get("/test-nanoid", async (req, res) => {
    try {
        const { generateNanoId } = await import('./src/utils/helper.js');
        const ids = [];
        for (let i = 0; i < 10; i++) {
            ids.push(generateNanoId());
        }
        console.log('🧪 Generated nanoids:', ids);
        res.json({ ids, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error('Error generating nanoids:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test link creation and redirect functionality
app.get("/test-link", async (req, res) => {
    try {
        console.log('🧪 Creating test link...');

        // Import required modules
        const { shortUrlServiceWithoutUser } = await import('./src/services/short_url.service.js');

        // Create a test short URL
        const testUrl = 'https://www.google.com';
        const shortCode = await shortUrlServiceWithoutUser(testUrl, '127.0.0.1', '1d');
        const fullShortUrl = `${process.env.APP_URL}/${shortCode}`;

        console.log('✅ Test link created:', { shortCode, fullShortUrl, originalUrl: testUrl });

        res.json({
            message: 'Test link created successfully!',
            originalUrl: testUrl,
            shortCode: shortCode,
            fullShortUrl: fullShortUrl,
            testInstructions: [
                `1. Click this link to test: ${fullShortUrl}`,
                '2. It should redirect you to Google',
                '3. Check the database with /debug/urls to see the entry',
                '4. The click count should increment each time you visit'
            ],
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error creating test link:', error);
        res.status(500).json({
            error: error.message,
            message: 'Failed to create test link'
        });
    }
});

// Test database query for specific URL
app.get("/test-find/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 Testing database query for:', id);

        // Try exact match
        const exactMatch = await UrlSchema.findOne({ short_url: id });
        console.log('🔍 Exact match result:', exactMatch ? 'Found' : 'Not found');

        // Try case-insensitive search
        const caseInsensitive = await UrlSchema.findOne({
            short_url: { $regex: new RegExp(`^${id}$`, 'i') }
        });
        console.log('🔍 Case-insensitive result:', caseInsensitive ? 'Found' : 'Not found');

        // Get all URLs to see what's actually in database
        const allUrls = await UrlSchema.find({}).limit(5).sort({ createdAt: -1 });
        console.log('🔍 Recent URLs in database:', allUrls.map(u => u.short_url));

        res.json({
            searchTerm: id,
            exactMatch: exactMatch ? exactMatch.short_url : null,
            caseInsensitive: caseInsensitive ? caseInsensitive.short_url : null,
            recentUrls: allUrls.map(u => u.short_url)
        });
    } catch (error) {
        console.error('Error in test-find:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use("/api/auth", auth_routes)
app.use("/api/create", short_url)
app.get("/api/urls", getUserUrlsController)



// Short URL redirect route - MUST be last to avoid conflicts with other routes
app.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Sanitize input - trim whitespace and handle URL encoding
        const sanitizedId = decodeURIComponent(id.trim());

        // Import the DAO function directly
        const { getShortUrl } = await import('./src/dao/short_url.js');
        const url = await getShortUrl(sanitizedId);

        if (!url || !url.full_url) {
            return res.status(404).json({
                success: false,
                message: "Short URL not found"
            });
        }

        res.redirect(url.full_url);
    } catch (error) {
        console.error('Error in redirect route:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>{
    connectDB();
    console.log("Connected to MongoDB");
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`🔍 Debug endpoint: http://localhost:${PORT}/debug/urls`);
    console.log(`❤️ Health endpoint: http://localhost:${PORT}/health`);
})

// get route will redirect
// post route will create short url...
// post route will create short url