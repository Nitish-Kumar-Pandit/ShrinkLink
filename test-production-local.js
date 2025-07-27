#!/usr/bin/env node

// Test script to simulate production environment locally
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Production Configuration Locally...\n');

// Set production environment variables
const env = {
  ...process.env,
  NODE_ENV: 'production',
  PORT: '3001',
  MONGO_URI: process.env.MONGO_URI || 'mongodb+srv://compilex-admin:CompileX2024@compilex.jhtzhys.mongodb.net/shrinklink?retryWrites=true&w=majority&appName=CompileX',
  JWT_SECRET: 'test-production-secret-key-123456789',
  VITE_API_URL: '',
  APP_URL: 'http://localhost:3001',
  FRONTEND_URL: 'http://localhost:3001',
  CORS_ORIGIN: 'http://localhost:3001'
};

console.log('🔧 Environment Variables:');
console.log('- NODE_ENV:', env.NODE_ENV);
console.log('- PORT:', env.PORT);
console.log('- MONGO_URI:', env.MONGO_URI ? 'SET' : 'NOT SET');
console.log('- VITE_API_URL:', env.VITE_API_URL || 'EMPTY (relative paths)');
console.log('');

// Start the server
console.log('🚀 Starting production server...');
const server = spawn('node', ['server.js'], {
  env,
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

server.on('close', (code) => {
  console.log(`🔚 Server exited with code ${code}`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});

console.log('📝 Test URLs after server starts:');
console.log('- Homepage: http://localhost:3001/');
console.log('- Health: http://localhost:3001/api/health');
console.log('- Debug: http://localhost:3001/api/debug/kVwY');
console.log('- Short URL: http://localhost:3001/kVwY');
console.log('- Dashboard: http://localhost:3001/dashboard');
console.log('');
console.log('Press Ctrl+C to stop the server');
