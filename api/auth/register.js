// Auth register endpoint
import { withMiddleware } from '../_middleware.js';
import { registerUser } from '../../BACKEND/src/controller/auth.controller.js';
import { validateRegister, validateRateLimit } from '../../BACKEND/src/middleware/validation.middleware.js';
import { checkDatabaseConnection } from '../../BACKEND/src/middleware/db.middleware.js';
import { runMiddleware } from '../_middleware.js';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Run validation middleware
    await runMiddleware(req, res, checkDatabaseConnection);
    await runMiddleware(req, res, validateRateLimit);
    await runMiddleware(req, res, validateRegister);
    
    // Call the controller
    return await registerUser(req, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export default withMiddleware(handler);
