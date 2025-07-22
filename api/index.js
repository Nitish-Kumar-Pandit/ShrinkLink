// Main API handler for Vercel
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Simple CORS handler
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

  // Simple health check
  if (req.url === '/api/health' || req.url === '/health') {
    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
    return;
  }

  // For now, return a simple response for all other routes
  res.status(200).json({
    message: "ShrinkLink API is running",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
