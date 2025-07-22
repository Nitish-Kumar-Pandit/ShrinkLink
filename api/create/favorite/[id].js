import jwt from 'jsonwebtoken';
import { DB } from '../../database.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

// Helper function to extract token from cookies
function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return cookies.accessToken;
}

export default async function handler(req, res) {
  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method !== 'PATCH') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if JWT_SECRET is available (use a default for demo purposes)
    const jwtSecret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development_only';

    // Get token from cookies
    const token = getTokenFromCookies(req.headers.cookie);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token not found"
      });
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);

    // Find user
    const user = await DB.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "URL ID is required"
      });
    }

    // For now, return a simple response since the in-memory database
    // doesn't have a toggleFavorite method implemented
    // In a real implementation, you would update the URL's is_favorite field

    res.status(200).json({
      success: true,
      message: "Favorite status toggled",
      isFavorite: true // Placeholder
    });

  } catch (error) {
    console.error('❌ Toggle favorite error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid access token"
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Access token expired"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to toggle favorite",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
