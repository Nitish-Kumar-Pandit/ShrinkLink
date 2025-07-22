import { DB } from '../database.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

// Helper function to get client IP
function getClientIP(req) {
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

  return clientIP;
}

// Helper function to count anonymous URLs for an IP
async function getAnonymousUrlCount(clientIP) {
  try {
    const allUrls = await DB.getAllUrls();
    
    // For in-memory database, we need to filter by clientIP
    // For MongoDB, this would be handled differently
    const anonymousUrls = allUrls.filter(url => 
      !url.user_id && url.clientIP === clientIP
    );
    
    return anonymousUrls.length;
  } catch (error) {
    console.error('Error counting anonymous URLs:', error);
    return 0;
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

    const clientIP = getClientIP(req);
    const ANONYMOUS_LIMIT = 3;
    
    const linksCreated = await getAnonymousUrlCount(clientIP);

    res.status(200).json({
      success: true,
      usage: {
        linksCreated,
        maxLinks: ANONYMOUS_LIMIT,
        remaining: Math.max(0, ANONYMOUS_LIMIT - linksCreated)
      }
    });

  } catch (error) {
    console.error('❌ Get anonymous usage error:', error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to get anonymous usage",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
