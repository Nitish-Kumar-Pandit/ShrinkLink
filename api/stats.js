// Get user stats endpoint
import { withMiddleware } from './_middleware.js';
import { getUserStatsController } from '../BACKEND/src/controller/short_url.controller.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Call the controller
    return await getUserStatsController(req, res);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
