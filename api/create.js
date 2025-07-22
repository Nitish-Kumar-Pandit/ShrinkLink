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
    const { full_url, custom_code, expires_in_days = 14 } = req.body;

    // Validate URL
    if (!full_url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(full_url);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
    }

    // Generate or use custom short code
    let short_code = custom_code || generateShortCode();
    
    // Check if custom code already exists
    if (custom_code) {
      const existing = await DB.findUrlByShortCode(custom_code);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Custom URL already exists'
        });
      }
    }

    // Calculate expiration date
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + parseInt(expires_in_days));

    // Create URL
    const urlData = {
      short_code,
      full_url,
      expires_at,
      user_id: null // For now, no user authentication
    };

    const newUrl = await DB.createUrl(urlData);

    res.status(201).json({
      success: true,
      data: {
        id: newUrl.id || newUrl._id,
        short_code: newUrl.short_code,
        full_url: newUrl.full_url,
        short_url: `${req.headers.host}/${newUrl.short_code}`,
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
