// Create short URL endpoint
import { withMiddleware } from '../_middleware.js';
import { createShortUrl } from '../../BACKEND/src/controller/short_url.controller.js';
import { validateCreateUrl, validateRateLimit } from '../../BACKEND/src/middleware/validation.middleware.js';
import { runMiddleware } from '../_middleware.js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run validation middleware
    await runMiddleware(req, res, validateRateLimit);
    await runMiddleware(req, res, validateCreateUrl);
    
    // Call the controller
    return await createShortUrl(req, res);
  } catch (error) {
    console.error('Create URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
