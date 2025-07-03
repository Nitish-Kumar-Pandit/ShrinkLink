import express from 'express';
import {createShortUrl, getAnonymousUsageController, refreshAnonymousLinksController, toggleFavorite} from '../controller/short_url.controller.js';
import { validateCreateUrl, validateRateLimit } from '../middleware/validation.middleware.js';
const router = express.Router();

router.post('/', validateRateLimit, validateCreateUrl, createShortUrl);
router.get('/anonymous-usage', getAnonymousUsageController);
router.delete('/refresh-anonymous', refreshAnonymousLinksController);
router.patch('/favorite/:id', toggleFavorite);

export default router;