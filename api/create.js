import { DB } from './database.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

// Generate random short code
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    // Match frontend structure: { url, slug, expiration }
    const { url, slug, expiration = '14d' } = req.body;

    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Generate or use custom short code
    let short_code = slug || generateShortCode();

    // Check if custom code already exists
    if (slug) {
      const existing = await DB.findUrlByShortCode(slug);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Custom URL already exists'
        });
      }
    }

    // Calculate expiration date from expiration string
    const expires_at = new Date();
    let days = 14; // default

    if (expiration) {
      if (expiration.endsWith('h')) {
        const hours = parseInt(expiration);
        expires_at.setHours(expires_at.getHours() + hours);
      } else if (expiration.endsWith('d')) {
        days = parseInt(expiration);
        expires_at.setDate(expires_at.getDate() + days);
      } else {
        // Fallback to days
        days = parseInt(expiration) || 14;
        expires_at.setDate(expires_at.getDate() + days);
      }
    } else {
      expires_at.setDate(expires_at.getDate() + days);
    }

    // Get client IP for anonymous users
    let clientIP = req.ip ||
                  req.connection?.remoteAddress ||
                  req.socket?.remoteAddress ||
                  (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
                  req.headers['x-forwarded-for']?.split(',')[0] ||
                  req.headers['x-real-ip'] ||
                  '127.0.0.1'; // Fallback for development

    // Clean up the IP (remove IPv6 prefix if present)
    if (clientIP && clientIP.startsWith('::ffff:')) {
      clientIP = clientIP.substring(7);
    }

    // Create URL
    const urlData = {
      short_code,
      full_url: url, // Use the url field from request
      expires_at,
      user_id: null, // For now, no user authentication
      clientIP: clientIP // Track IP for anonymous users
    };

    const newUrl = await DB.createUrl(urlData);

    // Match frontend expected response format
    res.status(201).json({
      success: true,
      shortUrl: `https://${req.headers.host}/${newUrl.short_code}`,
      data: {
        id: newUrl.id || newUrl._id,
        short_code: newUrl.short_code,
        full_url: newUrl.full_url,
        short_url: `https://${req.headers.host}/${newUrl.short_code}`,
        expires_at: newUrl.expires_at,
        created_at: newUrl.created_at,
        clicks: newUrl.clicks || 0
      },
      message: 'URL shortened successfully'
    });

  } catch (error) {
    console.error('❌ Create URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
