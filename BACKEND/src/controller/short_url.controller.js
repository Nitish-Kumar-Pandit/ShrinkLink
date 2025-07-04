import { getShortUrl, getUserUrls, getAnonymousUrlCount } from "../dao/short_url.js";
import { shortUrlServiceWithoutUser, shortUrlServiceWithUser } from "../services/short_url.service.js";
import UrlSchema from '../models/shorturl.model.js';
import { validationResult } from 'express-validator';

export const createShortUrl = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const data = req.body;
        let shortUrl;

        // Additional URL validation
        if (!data.url || typeof data.url !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid URL is required'
            });
        }

        // Validate URL format
        try {
            new URL(data.url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid URL format'
            });
        }

        if(req.user){
            shortUrl = await shortUrlServiceWithUser(data.url, req.user._id, data.slug, data.expiration);
        } else {
            // Check anonymous user limit
            let clientIP = req.ip ||
                          req.connection?.remoteAddress ||
                          req.socket?.remoteAddress ||
                          (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                          req.headers['x-forwarded-for']?.split(',')[0] ||
                          req.headers['x-real-ip'] ||
                          '127.0.0.1'; // Fallback for development

            // Clean up the IP (remove IPv6 prefix if present)
            if (clientIP && clientIP.startsWith('::ffff:')) {
                clientIP = clientIP.substring(7);
            }

            const anonymousCount = await getAnonymousUrlCount(clientIP);
            const ANONYMOUS_LIMIT = 3;

            if (anonymousCount >= ANONYMOUS_LIMIT) {
                return res.status(429).json({
                    success: false,
                    message: "Anonymous users are limited to 3 links. Please sign in to create more links.",
                    limit: ANONYMOUS_LIMIT,
                    current: anonymousCount
                });
            }

            shortUrl = await shortUrlServiceWithoutUser(data.url, clientIP, data.expiration);
        }

        const fullShortUrl = `${process.env.APP_URL}/${shortUrl}`;

        // Calculate status for the newly created URL
        const expiration = data.expiration || '14d'; // Default to 14 days
        let status = 'active';

        switch (expiration) {
            case '5h':
                status = 'expiring_soon'; // 5 hours is less than 1 day, so expiring soon
                break;
            case '1d':
                status = 'expiring_soon'; // 1 day is exactly the threshold for expiring soon
                break;
            case '7d':
            case '14d':
            default:
                status = 'active';
                break;
        }

        res.status(200).json({
            shortUrl: fullShortUrl,
            status: status,
            expiration: expiration
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create short URL"
        });
    }
}

export const redirectFromShortUrl = async (req, res) => {
    try {
        const { id } = req.params;

        const url = await getShortUrl(id);

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
}

// Toggle favorite status of a URL
export const toggleFavorite = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Find the URL and ensure it belongs to the user
        const url = await UrlSchema.findOne({
            _id: id,
            user: req.user._id
        });

        if (!url) {
            return res.status(404).json({
                success: false,
                message: "URL not found or access denied"
            });
        }

        // Toggle favorite status
        url.isFavorite = !url.isFavorite;
        await url.save();

        res.status(200).json({
            success: true,
            message: url.isFavorite ? "Added to favorites" : "Removed from favorites",
            isFavorite: url.isFavorite
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const createCustomUrl = async (req, res) => {
    const {url, slug} = req.body;
    const shortUrl = await shortUrlServiceWithoutUser(url, slug);
    res.status(200).json({shortUrl: `${process.env.APP_URL}/${shortUrl}`});
}

export const getUserUrlsController = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const urls = await getUserUrls(req.user._id);

        // Transform URLs to include full short URL and format data
        const formattedUrls = urls.map(url => ({
            id: url._id,
            full_url: url.full_url,
            short_url: url.short_url,
            shortUrl: `${process.env.APP_URL}/${url.short_url}`,
            clicks: url.clicks,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt,
            expiresAt: url.expiresAt,
            status: url.status,
            isFavorite: url.isFavorite || false
        }));

        // Calculate stats
        const stats = {
            totalUrls: formattedUrls.length,
            totalClicks: formattedUrls.reduce((sum, url) => sum + url.clicks, 0)
        };

        res.status(200).json({
            success: true,
            urls: formattedUrls,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch URLs"
        });
    }
}

export const getUserStatsController = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const urls = await getUserUrls(req.user._id);

        // Calculate comprehensive stats
        const totalUrls = urls.length;
        const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
        const activeUrls = urls.filter(url => url.status === 'active').length;
        const expiredUrls = urls.filter(url => url.status === 'expired').length;
        const expiringUrls = urls.filter(url => url.status === 'expiring').length;

        // Calculate click rate (percentage of URLs that have been clicked)
        const clickedUrls = urls.filter(url => url.clicks > 0).length;
        const clickRate = totalUrls > 0 ? Math.round((clickedUrls / totalUrls) * 100) : 0;

        // Calculate average clicks per URL
        const avgClicksPerUrl = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;

        const stats = {
            totalUrls,
            totalClicks,
            activeUrls,
            expiredUrls,
            expiringUrls,
            clickRate,
            avgClicksPerUrl,
            clickedUrls
        };

        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch stats"
        });
    }
}

export const getAnonymousUsageController = async (req, res) => {
    try {
        let clientIP = req.ip ||
                      req.connection?.remoteAddress ||
                      req.socket?.remoteAddress ||
                      (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                      req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      '127.0.0.1'; // Fallback for development

        // Clean up the IP (remove IPv6 prefix if present)
        if (clientIP && clientIP.startsWith('::ffff:')) {
            clientIP = clientIP.substring(7);
        }

        const count = await getAnonymousUrlCount(clientIP);
        const ANONYMOUS_LIMIT = 3;

        res.status(200).json({
            success: true,
            usage: {
                current: count,
                limit: ANONYMOUS_LIMIT,
                remaining: Math.max(0, ANONYMOUS_LIMIT - count)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch usage data"
        });
    }
}

export const refreshAnonymousLinksController = async (req, res) => {
    try {
        // Delete all anonymous URLs (URLs without a user)
        const result = await UrlSchema.deleteMany({
            user: { $exists: false },
            clientIP: { $exists: true }
        });

        res.status(200).json({
            success: true,
            message: `Successfully refreshed anonymous links. Deleted ${result.deletedCount} links.`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to refresh anonymous links"
        });
    }
}
