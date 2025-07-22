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

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Check if JWT_SECRET is available (use a default for demo purposes)
    const jwtSecret = process.env.JWT_SECRET || 'demo_jwt_secret_key_for_development_only';

    const existingUser = await DB.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userData = {
      username: name,
      email,
      password: hashedPassword,
      avatar: '',
      avatarUrl: `https://www.gravatar.com/avatar/${Buffer.from(email).toString('hex')}?d=identicon`
    };

    const user = await DB.createUser(userData);

    const token = jwt.sign(
      { userId: user.id || user._id, email: user.email },
      jwtSecret,
      { expiresIn: "24h" }
    );

    res.setHeader('Set-Cookie', `accessToken=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
    console.error('❌ Registration error:', error);
    console.error('❌ Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
