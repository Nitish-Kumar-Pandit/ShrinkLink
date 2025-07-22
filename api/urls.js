import jwt from 'jsonwebtoken';
import { DB } from './database.js';

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

// Helper function to calculate URL status
function calculateUrlStatus(url) {
  if (!url.expires_at) return 'active';
  
  const now = new Date();
  const expiresAt = new Date(url.expires_at);
  const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  if (now > expiresAt) {
    return 'expired';
  } else if (expiresAt <= oneDayFromNow) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
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
    if (req.method !== 'GET') {
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

    // Get user's URLs
    const urls = await DB.getUserUrls(user.id || user._id);
    
    // Format URLs with status and additional info
    const formattedUrls = urls.map(url => ({
      id: url.id || url._id,
      shortUrl: `https://${req.headers.host}/${url.short_code}`,
      originalUrl: url.full_url,
      shortCode: url.short_code,
      clicks: url.clicks || 0,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      status: calculateUrlStatus(url),
      isFavorite: url.is_favorite || false
    }));

    res.status(200).json({
      success: true,
      urls: formattedUrls
    });

  } catch (error) {
    console.error('❌ Get URLs error:', error);
    
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
      message: "Failed to get URLs",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
