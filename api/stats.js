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
    
    // Calculate statistics
    const totalUrls = urls.length;
    const totalClicks = urls.reduce((sum, url) => sum + (url.clicks || 0), 0);
    
    let activeUrls = 0;
    let expiredUrls = 0;
    let expiringUrls = 0;
    let clickedUrls = 0;
    
    urls.forEach(url => {
      const status = calculateUrlStatus(url);
      
      switch (status) {
        case 'active':
          activeUrls++;
          break;
        case 'expired':
          expiredUrls++;
          break;
        case 'expiring_soon':
          expiringUrls++;
          break;
      }
      
      if ((url.clicks || 0) > 0) {
        clickedUrls++;
      }
    });
    
    const avgClicksPerUrl = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;
    const clickRate = totalUrls > 0 ? ((clickedUrls / totalUrls) * 100).toFixed(1) : 0;

    const stats = {
      totalUrls,
      totalClicks,
      activeUrls,
      expiredUrls,
      expiringUrls,
      clickRate: parseFloat(clickRate),
      avgClicksPerUrl: parseFloat(avgClicksPerUrl),
      clickedUrls
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    
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
      message: "Failed to get stats",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
