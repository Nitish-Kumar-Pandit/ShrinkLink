import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DB } from '../database.js';

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

    // Check if JWT_SECRET is available (use a default for demo purposes)
    const jwtSecret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development_only';

    const user = await DB.findUserByEmail(email);
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
      { userId: user.id || user._id, email: user.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.setHeader('Set-Cookie', `accessToken=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
