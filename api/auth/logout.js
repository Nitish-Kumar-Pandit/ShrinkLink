// Auth logout endpoint
import { withMiddleware } from '../_middleware.js';
import { logoutUser } from '../../BACKEND/src/controller/auth.controller.js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Call the controller
    return await logoutUser(req, res);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
