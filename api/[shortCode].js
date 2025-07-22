import { DB } from './database.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

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
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }

    const { shortCode } = req.query;
    
    if (!shortCode) {
      return res.status(400).json({
        success: false,
        message: 'Short code is required'
      });
    }

    console.log(`🔍 Looking for short code: ${shortCode}`);
    
    // Find URL by short code
    const url = await DB.findUrlByShortCode(shortCode);
    
    if (!url) {
      console.log(`❌ Short code not found: ${shortCode}`);
      return res.status(404).json({
        success: false,
        message: "Short URL not found"
      });
    }
    
    // Check if URL has expired
    if (url.expires_at && new Date() > url.expires_at) {
      console.log(`⏰ URL expired: ${shortCode}`);
      return res.status(410).json({
        success: false,
        message: "This short URL has expired"
      });
    }
    
    // Update click count
    await DB.updateUrlClicks(shortCode);
    
    console.log(`✅ Redirecting ${shortCode} to ${url.full_url}`);
    
    // Perform the redirect
    res.redirect(302, url.full_url);
    
  } catch (error) {
    console.error('❌ Redirect error:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
