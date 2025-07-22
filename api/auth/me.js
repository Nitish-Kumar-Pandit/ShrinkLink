// Auth me endpoint
import { withMiddleware } from '../_middleware.js';
import { authmiddleware } from '../../BACKEND/src/middleware/auth.middleware.js';
import { runMiddleware } from '../_middleware.js';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run auth middleware
    await runMiddleware(req, res, authmiddleware);
    
    // Return user data
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
        avatarUrl: req.user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
