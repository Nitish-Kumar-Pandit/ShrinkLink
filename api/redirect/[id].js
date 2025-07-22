// Short URL redirect endpoint
import { withMiddleware } from '../_middleware.js';
import { getShortUrl } from '../../BACKEND/src/dao/short_url.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    // Sanitize input - trim whitespace and handle URL encoding
    const sanitizedId = decodeURIComponent(id.trim());

    const url = await getShortUrl(sanitizedId);

    if (!url || !url.full_url) {
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }

    res.redirect(url.full_url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export default withMiddleware(handler);
