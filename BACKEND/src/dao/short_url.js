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
    newUrl.save()
}

export const getShortUrl = async (id) =>{
    return await UrlSchema.findOneAndUpdate({ short_url: id }, {$inc: {clicks: 1}});
}