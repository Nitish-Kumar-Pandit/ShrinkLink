import { generateNanoId } from "../utils/helper.js";
import UrlSchema from '../models/shorturl.model.js';
import { getCustomUrl, saveUrl } from "../dao/short_url.js";

// Helper function to calculate expiration date
const calculateExpirationDate = (expiration) => {
    // Default to 14 days if no expiration provided
    if (!expiration) expiration = '14d';

    const now = new Date();

    switch (expiration) {
        case '5h':
            return new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours
        case '1d':
            return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
        case '7d':
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        case '14d':
            return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
        default:
            return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // Default to 14 days
    }
};


export const shortUrlServiceWithoutUser = async (url, clientIP, expiration = '14d') => {
    const shortUrl = generateNanoId(4);
    const expiresAt = calculateExpirationDate(expiration);
    await saveUrl(shortUrl, url, null, clientIP, expiresAt);
    return shortUrl;
}

export const shortUrlServiceWithUser = async (url, userId, slug = null, expiration = '14d') => {
    const shortUrl = slug || generateNanoId(4);
    const exist = await getCustomUrl(slug);
    if(exist){
        throw new Error(`Custom URL '${slug}' already exists. Please choose a different custom URL.`);
    }
    const expiresAt = calculateExpirationDate(expiration);
    await saveUrl(shortUrl, url, userId, null, expiresAt);
    return shortUrl;
}