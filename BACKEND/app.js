import express from 'express';
const app = express();
import { nanoid } from 'nanoid';
import dotenv from "dotenv";
import short_url from './src/routes/short_url.route.js';
import UrlSchema from './src/models/shorturl.model.js';
import connectDB from './src/config/mongo.config.js';
import auth_routes from './src/routes/auth.route.js';
import { redirectFromShortUrl, getUserUrlsController, getUserStatsController } from './src/controller/short_url.controller.js';
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





app.use("/api/auth", auth_routes)
app.use("/api/create", short_url)
app.get("/api/urls", getUserUrlsController)
app.get("/api/stats", getUserStatsController)



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
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>{
    connectDB();
})