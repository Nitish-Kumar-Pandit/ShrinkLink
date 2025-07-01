import { generateNanoId } from "../utils/helper.js";
import UrlSchema from '../models/shorturl.model.js';
import { saveUrl } from "../dao/short_url.js";


export const shortUrlServiceWithoutUser = async (url) => {
    const shortUrl = await generateNanoId(7);
    await saveUrl(shortUrl, url);
    return shortUrl;
}

export const shortUrlServiceWithUser = async (url) => {
    const shortUrl = await generateNanoId(7);
    await saveUrl(shortUrl, url, userId);    
    return shortUrl;
}