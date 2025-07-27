#!/usr/bin/env node

/**
 * Setup script for ShrinkLink Render deployment
 * This script helps configure the application for separate backend/frontend deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up ShrinkLink for Render deployment...\n');

// Check if required directories exist
const backendDir = path.join(__dirname, 'BACKEND');
const frontendDir = path.join(__dirname, 'FRONTEND');

if (!fs.existsSync(backendDir)) {
    console.error('❌ BACKEND directory not found!');
    process.exit(1);
}

if (!fs.existsSync(frontendDir)) {
    console.error('❌ FRONTEND directory not found!');
    process.exit(1);
}

console.log('✅ Directory structure verified');

// Create .env.example files
const backendEnvExample = `# Backend Environment Variables
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shrinklink?retryWrites=true&w=majority
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_URL_EXPIRY_DAYS=365
LOG_LEVEL=info
HELMET_CSP_ENABLED=true
DB_MAX_POOL_SIZE=20
DB_MIN_POOL_SIZE=10
DB_SERVER_SELECTION_TIMEOUT_MS=5000
DB_SOCKET_TIMEOUT_MS=45000
DB_MAX_IDLE_TIME_MS=30000
FRONTEND_URL=https://your-frontend-service.onrender.com
CORS_ORIGIN=https://your-frontend-service.onrender.com
APP_URL=https://your-backend-service.onrender.com
FRONTEND_ROUTES=auth,register,dashboard,analytics-demo,test-redirect`;

const frontendEnvExample = `# Frontend Environment Variables
NODE_ENV=production
VITE_API_URL=https://your-backend-service.onrender.com
VITE_BACKEND_URL=https://your-backend-service.onrender.com
VITE_APP_NAME=ShrinkLink
VITE_APP_VERSION=1.0.0`;

// Write .env.example files
fs.writeFileSync(path.join(backendDir, '.env.example'), backendEnvExample);
fs.writeFileSync(path.join(frontendDir, '.env.example'), frontendEnvExample);

console.log('✅ Created .env.example files');

// Create local development .env files if they don't exist
const backendEnvLocal = `# Local Development Environment
NODE_ENV=development
JWT_SECRET=local_development_secret_key_123456789
PORT=5000
MONGO_URI=mongodb://localhost:27017/shrinklink
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_URL_EXPIRY_DAYS=365
LOG_LEVEL=debug
HELMET_CSP_ENABLED=false
DB_MAX_POOL_SIZE=10
DB_MIN_POOL_SIZE=5
DB_SERVER_SELECTION_TIMEOUT_MS=5000
DB_SOCKET_TIMEOUT_MS=45000
DB_MAX_IDLE_TIME_MS=30000
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5000
FRONTEND_ROUTES=auth,register,dashboard,analytics-demo,test-redirect`;

const frontendEnvLocal = `# Local Development Environment
NODE_ENV=development
VITE_API_URL=http://localhost:5000
VITE_BACKEND_URL=http://localhost:5000
VITE_APP_NAME=ShrinkLink
VITE_APP_VERSION=1.0.0`;

// Only create .env files if they don't exist
if (!fs.existsSync(path.join(backendDir, '.env'))) {
    fs.writeFileSync(path.join(backendDir, '.env'), backendEnvLocal);
    console.log('✅ Created BACKEND/.env for local development');
} else {
    console.log('ℹ️  BACKEND/.env already exists, skipping');
}

if (!fs.existsSync(path.join(frontendDir, '.env'))) {
    fs.writeFileSync(path.join(frontendDir, '.env'), frontendEnvLocal);
    console.log('✅ Created FRONTEND/.env for local development');
} else {
    console.log('ℹ️  FRONTEND/.env already exists, skipping');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update MONGO_URI in BACKEND/.env with your MongoDB connection string');
console.log('2. Install dependencies: npm run install:all');
console.log('3. Start development: npm run dev:both');
console.log('4. For deployment, follow RENDER_DEPLOYMENT_GUIDE.md');
console.log('\n🔗 Useful commands:');
console.log('- Backend only: cd BACKEND && npm run dev');
console.log('- Frontend only: cd FRONTEND && npm run dev');
console.log('- Build frontend: cd FRONTEND && npm run build');
console.log('- Test backend: curl http://localhost:5000/health');
