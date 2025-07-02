import { getShortUrl } from "../dao/short_url.js";
import { shortUrlServiceWithoutUser, shortUrlServiceWithUser } from "../services/short_url.service.js";

export const createShortUrl = async (req, res) => {
    const data = req.body;
    let shortUrl;
    if(req.user){
        shortUrl = await shortUrlServiceWithUser(data.url, req.user._id, data.slug);
    }else{
        shortUrl = await shortUrlServiceWithoutUser(data.url);
    }
    res.status(200).json({shortUrl: process.env.APP_URL + shortUrl});
}

export const redirectFromShortUrl = async (req, res) => {
    const { id } = req.params;
    const url = await getShortUrl(id);
    res.redirect(url.full_url);
}

export const createCustomUrl = async (req, res) => {
    const {url, slug} = req.body;
    const shortUrl = await shortUrlServiceWithoutUser(url, slug);
    res.status(200).json({shortUrl: process.env.APP_URL + shortUrl});
}
