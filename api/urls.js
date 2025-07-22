// Get user URLs endpoint
import { withMiddleware } from './_middleware.js';
import { getUserUrlsController } from '../BACKEND/src/controller/short_url.controller.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Call the controller
    return await getUserUrlsController(req, res);
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
