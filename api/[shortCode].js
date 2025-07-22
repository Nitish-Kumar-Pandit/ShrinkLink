import mongoose from 'mongoose';

// URL Schema
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  customUrl: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ipAddress: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastClickedAt: { type: Date, default: null }
});

const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

// Database connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
    });
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { shortCode } = req.query;

    if (!shortCode) {
      return res.status(400).json({
        success: false,
        message: "Short code is required"
      });
    }

    // Find URL by shortCode or customUrl
    const url = await Url.findOne({
      $or: [
        { shortCode: shortCode },
        { customUrl: shortCode }
      ]
    });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found"
      });
    }

    // Check if URL is expired
    if (new Date() > url.expiresAt) {
      return res.status(410).json({
        success: false,
        message: "URL has expired"
      });
    }

    // Check if URL is active
    if (!url.isActive) {
      return res.status(410).json({
        success: false,
        message: "URL is no longer active"
      });
    }

    // Update click count and last clicked time
    await Url.findByIdAndUpdate(url._id, {
      $inc: { clicks: 1 },
      lastClickedAt: new Date()
    });

    // Redirect to original URL
    res.redirect(302, url.originalUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
