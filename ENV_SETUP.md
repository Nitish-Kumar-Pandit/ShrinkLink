# 🔧 Environment Variables Setup Guide

This guide explains how to set up and manage environment variables for the ShrinkLink application.

## 📁 File Structure

```
ShrinkLink/
├── .env                    # 🔑 Main environment file (all variables)
├── .env.example           # 📋 Template file with examples
├── setup-env.js          # 🔧 Script to distribute variables
├── BACKEND/
│   └── .env              # 🔙 Backend-specific variables (auto-generated)
└── FRONTEND/
    └── .env              # 🔜 Frontend-specific variables (auto-generated)
```

## 🚀 Quick Setup

### 1. Copy the Template
```bash
cp .env.example .env
```

### 2. Edit Your Variables
Open `.env` and update the values:

```bash
# Required: Update these values
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/shrinklink
JWT_SECRET=your-super-secure-32-character-secret-key
VITE_API_URL=http://localhost:3000

# Optional: Customize these if needed
PORT=3000
FRONTEND_URL=http://localhost:5174
```

### 3. Distribute Variables
Run the setup script to create environment files for both frontend and backend:

```bash
node setup-env.js
```

### 4. Start the Application
```bash
# Terminal 1: Start Backend
cd BACKEND
npm run dev

# Terminal 2: Start Frontend
cd FRONTEND
npm run dev
```

## 📋 Environment Variables Reference

### 🔙 Backend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MONGO_URI` | ✅ | - | MongoDB connection string |
| `JWT_SECRET` | ✅ | - | Secret key for JWT tokens (min 32 chars) |
| `PORT` | ❌ | 3000 | Server port |
| `NODE_ENV` | ❌ | development | Environment mode |
| `APP_URL` | ❌ | http://localhost:3000 | Backend URL for short links |
| `FRONTEND_URL` | ❌ | http://localhost:5174 | Frontend URL for CORS |
| `BCRYPT_ROUNDS` | ❌ | 12 | Password hashing rounds |
| `RATE_LIMIT_WINDOW_MS` | ❌ | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | 100 | Max requests per window |
| `DEFAULT_URL_EXPIRY_DAYS` | ❌ | 365 | Default URL expiration |

### 🔜 Frontend Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ | - | Backend API URL |
| `VITE_APP_NAME` | ❌ | ShrinkLink | Application name |
| `VITE_APP_VERSION` | ❌ | 1.0.0 | Application version |

## 🌍 Environment-Specific Configurations

### 🏠 Local Development
```bash
# .env
MONGO_URI=mongodb://localhost:27017/shrinklink
JWT_SECRET=dev-secret-key-32-characters-long
VITE_API_URL=http://localhost:3000
NODE_ENV=development
```

### 🚀 Production Deployment

#### Render.com (Backend)
```bash
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/shrinklink
JWT_SECRET=production-secret-key-32-characters
NODE_ENV=production
PORT=10000
APP_URL=https://your-app.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Vercel (Frontend)
```bash
VITE_API_URL=https://your-backend.onrender.com
VITE_APP_NAME=ShrinkLink
VITE_APP_VERSION=1.0.0
```

## 🔒 Security Best Practices

### 1. JWT Secret Generation
Generate a secure JWT secret:
```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Online generator (use with caution)
# Visit: https://generate-secret.vercel.app/32
```

### 2. MongoDB Security
- Use MongoDB Atlas with IP whitelisting
- Create a dedicated database user with minimal permissions
- Use strong passwords
- Enable authentication

### 3. Environment File Security
- Never commit `.env` files to version control
- Use different secrets for different environments
- Rotate secrets regularly
- Use environment-specific configurations

## 🔧 Troubleshooting

### Common Issues

#### 1. "Database service unavailable"
```bash
# Check your MongoDB connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/shrinklink

# Verify:
# - Username and password are correct
# - IP address is whitelisted
# - Database name is correct
```

#### 2. "API calls failing"
```bash
# Check frontend API URL
VITE_API_URL=http://localhost:3000

# Verify:
# - Backend is running on the specified port
# - No CORS issues
# - URL format is correct
```

#### 3. "JWT token invalid"
```bash
# Ensure JWT secret is set and consistent
JWT_SECRET=your-32-character-secret-key

# Verify:
# - Secret is at least 32 characters
# - Same secret used in all environments
# - No extra spaces or characters
```

### 4. Environment Variables Not Loading
```bash
# Check file locations
ls -la .env BACKEND/.env FRONTEND/.env

# Regenerate environment files
node setup-env.js

# Restart development servers
```

## 📚 Additional Resources

### Environment Variable Tools
- [dotenv](https://github.com/motdotla/dotenv) - Loads environment variables
- [cross-env](https://github.com/kentcdodds/cross-env) - Cross-platform environment variables
- [env-cmd](https://github.com/toddbluhm/env-cmd) - Environment variable management

### Deployment Guides
- [Render Deployment](./DEPLOYMENT_GUIDE.md#render-deployment)
- [Vercel Deployment](./DEPLOYMENT_GUIDE.md#vercel-deployment)
- [Railway Deployment](./DEPLOYMENT_GUIDE.md#railway-deployment)

### Security Resources
- [OWASP Environment Variables](https://owasp.org/www-community/vulnerabilities/Improper_Data_Validation)
- [12-Factor App Config](https://12factor.net/config)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## 🆘 Need Help?

If you encounter issues:

1. Check this guide first
2. Verify your environment variables
3. Check the application logs
4. Ensure all services are running
5. Review the main README.md for setup instructions

---

**Remember**: Keep your environment variables secure and never commit sensitive data to version control! 🔒
