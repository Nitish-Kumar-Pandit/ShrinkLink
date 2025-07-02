import { generateNanoId } from "../utils/helper.js";
import UrlSchema from '../models/shorturl.model.js';
import { getCustomUrl, saveUrl } from "../dao/short_url.js";


export const shortUrlServiceWithoutUser = async (url) => {
    const shortUrl = generateNanoId(4);
    await saveUrl(shortUrl, url);
    return shortUrl;
}

export const shortUrlServiceWithUser = async (url, userId, slug=null) => {
    const shortUrl = slug || generateNanoId(4);
    const exist = await getCustomUrl(slug);
    if(exist){
        throw new Error("URL already exists");
    }
    await saveUrl(shortUrl, url, userId);    
    return shortUrl;
}