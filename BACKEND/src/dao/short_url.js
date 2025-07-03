import UrlSchema from '../models/shorturl.model.js';
export const saveUrl = async (shortUrl, longUrl, userId, clientIP, expiresAt) => {
    console.log('💾 BEFORE save - shortUrl:', shortUrl, 'type:', typeof shortUrl);

    // Ensure expiresAt is always provided (default to 14 days from now if not)
    if (!expiresAt) {
        expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default
    }

    const newUrl = new UrlSchema({
        full_url: longUrl,
        short_url: shortUrl,
        clicks: 0,
        expiresAt: expiresAt // Always set expiration
    });

    console.log('💾 AFTER creating UrlSchema - newUrl.short_url:', newUrl.short_url);

    if (userId) {
        newUrl.user = userId;
    }
    if (clientIP && !userId) {
        newUrl.clientIP = clientIP;
    }

    console.log('💾 Saving URL to database:', { shortUrl, longUrl, userId, clientIP, expiresAt });
    const savedUrl = await newUrl.save();
    console.log('✅ URL saved successfully - savedUrl.short_url:', savedUrl.short_url);
    return savedUrl;
}

export const getShortUrl = async (id) =>{
    // Sanitize input - trim whitespace and handle encoding
    const sanitizedId = decodeURIComponent(id.trim());

    // First find the URL without updating clicks to check expiration
    // Use case-insensitive search to handle case sensitivity issues
    const url = await UrlSchema.findOne({
        short_url: { $regex: new RegExp(`^${sanitizedId}$`, 'i') }
    });

    if (!url) {
        return null;
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > url.expiresAt) {
        return null;
    }

    // URL is valid, increment clicks and return
    // Use the exact short_url from database for the update (preserves original case)
    const result = await UrlSchema.findOneAndUpdate(
        { short_url: url.short_url },
        { $inc: { clicks: 1 } },
        { new: true } // Return the updated document
    );

    return result;
}

export const getCustomUrl = async (slug) =>{
    return await UrlSchema.findOne({ short_url: slug });
}

// Helper function to calculate URL status
const calculateUrlStatus = (url) => {
    // Handle legacy URLs without expiration dates
    if (!url.expiresAt) {
        return 'expired'; // Mark legacy URLs as expired to encourage recreation
    }

    const now = new Date();
    const expiresAt = new Date(url.expiresAt);

    if (now > expiresAt) {
        return 'expired';
    }

    // Check if expiring within 1 day (24 * 60 * 60 * 1000 milliseconds)
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    if (expiresAt <= oneDayFromNow) {
        return 'expiring_soon';
    }

    return 'active';
};

export const getUserUrls = async (userId) => {
    const urls = await UrlSchema.find({ user: userId }).sort({ createdAt: -1 });

    // Add status to each URL
    const urlsWithStatus = urls.map(url => {
        const urlObj = url.toObject();
        urlObj.status = calculateUrlStatus(url);
        return urlObj;
    });

    return urlsWithStatus;
}

export const getAnonymousUrlCount = async (clientIP) => {
    if (!clientIP) return 0;
    return await UrlSchema.countDocuments({
        clientIP: clientIP,
        user: { $exists: false }
    });
}