# 🔧 ShrinkLink Environment Variables Configuration

## 📁 File Structure Overview

```
ShrinkLink/
├── .env                    # 🔑 MAIN: All environment variables (DO NOT COMMIT)
├── .env.example           # 📋 Template with examples and documentation
├── setup-env.js          # 🔧 Script to distribute variables to subfolders
├── ENV_SETUP.md          # 📚 Detailed setup guide
├── ENVIRONMENT_VARIABLES.md # 📖 This file - quick reference
├── BACKEND/
│   └── .env              # 🔙 Backend variables (auto-generated from root)
└── FRONTEND/
    └── .env              # 🔜 Frontend variables (auto-generated from root)
```

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Copy template and edit with your values
cp .env.example .env

# Edit the .env file with your actual values
# Required: MONGO_URI, JWT_SECRET, VITE_API_URL
```

### 2. Generate Environment Files
```bash
# Option 1: Use npm script
npm run setup

# Option 2: Run script directly
node setup-env.js
```

### 3. Start Development
```bash
# Start backend
cd BACKEND && npm run dev

# Start frontend (new terminal)
cd FRONTEND && npm run dev
```

## 📋 Environment Variables Reference

### 🔙 Backend Variables (Non-VITE prefixed)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| **MONGO_URI** | Required | - | MongoDB connection string |
| **JWT_SECRET** | Required | - | JWT signing secret (32+ chars) |
| PORT | Optional | 3000 | Server port |
| NODE_ENV | Optional | development | Environment mode |
| APP_URL | Optional | http://localhost:3000 | Backend URL for short links |
| FRONTEND_URL | Optional | http://localhost:5174 | Frontend URL for CORS |
| BCRYPT_ROUNDS | Optional | 12 | Password hashing rounds |
| RATE_LIMIT_WINDOW_MS | Optional | 900000 | Rate limit window (15 min) |
| RATE_LIMIT_MAX_REQUESTS | Optional | 100 | Max requests per window |
| DEFAULT_URL_EXPIRY_DAYS | Optional | 365 | Default URL expiration |
| LOG_LEVEL | Optional | info | Logging level |
| HELMET_CSP_ENABLED | Optional | true | Enable CSP headers |
| CORS_ORIGIN | Optional | http://localhost:5174 | CORS allowed origin |
| DB_MAX_POOL_SIZE | Optional | 20 | MongoDB max connections |
| DB_MIN_POOL_SIZE | Optional | 10 | MongoDB min connections |

### 🔜 Frontend Variables (VITE_ prefixed)

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| **VITE_API_URL** | Required | - | Backend API URL |
| VITE_APP_NAME | Optional | ShrinkLink | Application name |
| VITE_APP_VERSION | Optional | 1.0.0 | Application version |

### 🔮 Future Features (Optional)

| Variable | Description |
|----------|-------------|
| SMTP_HOST | Email server host |
| SMTP_PORT | Email server port |
| SMTP_USER | Email username |
| SMTP_PASS | Email password |
| GOOGLE_ANALYTICS_ID | Google Analytics tracking ID |
| REDIS_URL | Redis cache connection |
| GOOGLE_CLIENT_ID | OAuth Google client ID |
| GOOGLE_CLIENT_SECRET | OAuth Google client secret |
| GITHUB_CLIENT_ID | OAuth GitHub client ID |
| GITHUB_CLIENT_SECRET | OAuth GitHub client secret |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| SENTRY_DSN | Sentry error tracking DSN |

## 🌍 Environment Examples

### 🏠 Local Development
```bash
# .env
MONGO_URI=mongodb://localhost:27017/shrinklink
JWT_SECRET=local-dev-secret-32-characters-long
VITE_API_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5174
```

### 🚀 Production (Render + Vercel)
```bash
# Root .env for production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/shrinklink
JWT_SECRET=production-secret-32-characters-minimum
NODE_ENV=production
PORT=10000
APP_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
VITE_API_URL=https://your-backend.onrender.com
CORS_ORIGIN=https://your-frontend.vercel.app
```

## 🔒 Security Guidelines

### 1. JWT Secret
```bash
# Generate secure JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. MongoDB Security
- Use MongoDB Atlas with IP whitelisting
- Create dedicated database user with minimal permissions
- Use strong passwords
- Enable authentication

### 3. File Security
- **NEVER** commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Use `.env.example` for documentation

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MongoDB URI format
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shrinklink

# Verify:
# ✅ Username/password correct
# ✅ IP address whitelisted
# ✅ Database name correct
# ✅ Network connectivity
```

#### Frontend API Calls Failing
```bash
# Check API URL configuration
VITE_API_URL=http://localhost:3000

# Verify:
# ✅ Backend server running
# ✅ Port matches backend
# ✅ No CORS issues
# ✅ URL format correct
```

#### JWT Authentication Issues
```bash
# Ensure JWT secret is consistent
JWT_SECRET=your-32-character-secret-key

# Verify:
# ✅ Secret is 32+ characters
# ✅ Same secret in all environments
# ✅ No extra spaces/characters
# ✅ Secret not exposed in logs
```

## 📚 Available Scripts

```bash
# Environment setup
npm run setup              # Generate .env files for frontend/backend
npm run setup:env          # Same as above

# Development
npm run dev                # Start backend only
npm run dev:frontend       # Start frontend only
npm run dev:both           # Start both (requires concurrently)

# Installation
npm run install:all        # Install dependencies for all projects

# Production
npm run build              # Build frontend for production
npm run start              # Start production server
```

## 🆘 Need Help?

1. **Check this guide** for common solutions
2. **Verify environment variables** are set correctly
3. **Check application logs** for specific errors
4. **Ensure all services are running** (MongoDB, backend, frontend)
5. **Review main README.md** for additional setup instructions

## 📖 Additional Resources

- [ENV_SETUP.md](./ENV_SETUP.md) - Detailed setup guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [README.md](./README.md) - Main project documentation

---

**Remember**: Keep your environment variables secure! 🔒
