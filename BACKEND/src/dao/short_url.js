import UrlSchema from '../models/shorturl.model.js';
export const saveUrl = async (shortUrl, longUrl, userId) => {
    const newUrl = new UrlSchema({
        full_url: longUrl,
        short_url: shortUrl,
        clicks: 0
    });
    if (userId) {
        newUrl.user = userId;
    }
    await newUrl.save()
}

export const getShortUrl = async (id) =>{
    return await UrlSchema.findOneAndUpdate({ short_url: id }, {$inc: {clicks: 1}});
}

export const getCustomUrl = async (slug) =>{
    return await UrlSchema.findOne({ short_url: slug });
}