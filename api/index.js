import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

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

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Url = mongoose.models.Url || mongoose.model('Url', urlSchema);

// Database connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;

  // Check if MONGO_URI is available
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable is not set');
    throw new Error('Database configuration missing. Please set MONGO_URI environment variable.');
  }

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 MongoDB URI:', process.env.MONGO_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });
    isConnected = true;
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Full error:', error);
    throw new Error(`Failed to connect to database: ${error.message}`);
  }
}

// Utility functions
function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] ||
         req.headers['x-real-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         '127.0.0.1';
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

// Register handler
async function handleRegister(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET environment variable is not set');
      return res.status(500).json({
        success: false,
        message: "Server configuration error. Please contact administrator."
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username: name,
      email,
      password: hashedPassword,
      avatar: '',
      avatarUrl: `https://www.gravatar.com/avatar/${Buffer.from(email).toString('hex')}?d=identicon`
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.setHeader('Set-Cookie', `accessToken=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Login handler
async function handleLogin(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.setHeader('Set-Cookie', `accessToken=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    },
    token
  });
}

// Create URL handler
async function handleCreateUrl(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { originalUrl, customUrl, expirationTime } = req.body;
  const clientIP = getClientIP(req);

  if (!originalUrl) {
    return res.status(400).json({
      success: false,
      message: "Original URL is required"
    });
  }

  try {
    new URL(originalUrl);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid URL format"
    });
  }

  let userId = null;
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      // Token invalid, continue as anonymous
    }
  }

  // Check anonymous user limits
  if (!userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await Url.countDocuments({
      ipAddress: clientIP,
      userId: null,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    if (todayCount >= 3) {
      return res.status(429).json({
        success: false,
        message: "Anonymous users can only create 3 URLs per day. Please register for unlimited access."
      });
    }
  }

  // Check if custom URL already exists
  if (customUrl) {
    const existingCustom = await Url.findOne({
      $or: [
        { customUrl: customUrl },
        { shortCode: customUrl }
      ]
    });

    if (existingCustom) {
      return res.status(400).json({
        success: false,
        message: "URL already exists"
      });
    }
  }

  // Generate unique short code
  let shortCode;
  let attempts = 0;
  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts > 10) {
      shortCode = generateShortCode(8);
    }
  } while (await Url.findOne({ shortCode }));

  // Calculate expiration date
  const expiresAt = new Date();
  switch (expirationTime) {
    case '5h':
      expiresAt.setHours(expiresAt.getHours() + 5);
      break;
    case '1d':
      expiresAt.setDate(expiresAt.getDate() + 1);
      break;
    case '7d':
      expiresAt.setDate(expiresAt.getDate() + 7);
      break;
    case '14d':
    default:
      expiresAt.setDate(expiresAt.getDate() + 14);
      break;
  }

  const url = new Url({
    originalUrl,
    shortCode,
    customUrl: customUrl || '',
    userId,
    ipAddress: clientIP,
    expiresAt
  });

  await url.save();

  const baseUrl = process.env.VERCEL_URL ?
    `https://${process.env.VERCEL_URL}` :
    'http://localhost:3000';

  const shortUrl = customUrl ?
    `${baseUrl}/${customUrl}` :
    `${baseUrl}/${shortCode}`;

  res.status(201).json({
    success: true,
    message: "URL shortened successfully",
    data: {
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl,
      shortCode: url.shortCode,
      customUrl: url.customUrl,
      clicks: url.clicks,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt
    }
  });
}

// Get user URLs handler
async function handleUserUrls(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }

  const urls = await Url.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  const baseUrl = process.env.VERCEL_URL ?
    `https://${process.env.VERCEL_URL}` :
    'http://localhost:3000';

  const formattedUrls = urls.map(url => {
    const shortUrl = url.customUrl ?
      `${baseUrl}/${url.customUrl}` :
      `${baseUrl}/${url.shortCode}`;

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    let status = 'active';

    if (now > url.expiresAt) {
      status = 'expired';
    } else if (url.expiresAt <= oneDayFromNow) {
      status = 'expiring_soon';
    }

    return {
      id: url._id,
      originalUrl: url.originalUrl,
      shortUrl,
      shortCode: url.shortCode,
      customUrl: url.customUrl,
      clicks: url.clicks,
      status,
      expiresAt: url.expiresAt,
      createdAt: url.createdAt,
      lastClickedAt: url.lastClickedAt
    };
  });

  res.status(200).json({
    success: true,
    data: formattedUrls
  });
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
    await connectDB();

    const { action } = req.query;

    switch (action) {
      case 'register':
        return await handleRegister(req, res);
      case 'login':
        return await handleLogin(req, res);
      case 'create-url':
        return await handleCreateUrl(req, res);
      case 'user-urls':
        return await handleUserUrls(req, res);
      default:
        return res.status(404).json({ message: 'Endpoint not found' });
    }

  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
