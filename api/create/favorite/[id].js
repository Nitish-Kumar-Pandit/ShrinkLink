// Toggle favorite endpoint
import { withMiddleware } from '../../_middleware.js';
import { toggleFavorite } from '../../../BACKEND/src/controller/short_url.controller.js';

const handler = async (req, res) => {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Add the id parameter to req.params for compatibility
    req.params = { id: req.query.id };
    
    // Call the controller
    return await toggleFavorite(req, res);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
