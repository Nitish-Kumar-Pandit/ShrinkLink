# 🚀 Render Deployment Guide for ShrinkLink

## 📋 Quick Fix for Current Deployment Issue

### Problem
Your deployment is failing because Render is trying to run `npm run dev` which uses `nodemon` (a development dependency).

### Solution
1. **Change Start Command in Render Dashboard:**
   - Go to your Render service settings
   - Change **Start Command** from `npm run dev` to `npm start`

2. **Set Environment Variables in Render:**
   Add these in your Render dashboard under "Environment":

```bash
MONGO_URI=mongodb+srv://compilex-admin:CompileX2024@compilex.jhtzhys.mongodb.net/shrinklink?retryWrites=true&w=majority&appName=CompileX
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
NODE_ENV=production
PORT=10000
APP_URL=https://your-app-name.onrender.com
FRONTEND_URL=https://your-frontend-domain.com
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DEFAULT_URL_EXPIRY_DAYS=365
LOG_LEVEL=info
HELMET_CSP_ENABLED=true
CORS_ORIGIN=https://your-frontend-domain.com
DB_MAX_POOL_SIZE=20
DB_MIN_POOL_SIZE=10
```

## 🔧 Complete Render Setup

### 1. Repository Setup
Make sure your repository has these files in the root:
- `package.json` (for root-level dependencies)
- `BACKEND/` folder with your backend code
- `BACKEND/package.json` with production dependencies

### 2. Render Service Configuration

#### Build Settings:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `BACKEND`

#### Environment Variables:
Set all the environment variables listed above, replacing:
- `your-app-name` with your actual Render app name
- `your-frontend-domain.com` with your frontend URL (Vercel/Netlify)

### 3. Database Setup
Your MongoDB Atlas connection should work with the provided `MONGO_URI`. Make sure:
- IP address `0.0.0.0/0` is whitelisted in MongoDB Atlas
- Database user `compilex-admin` has read/write permissions
- Database name is `shrinklink`

## 🔍 Troubleshooting

### Common Issues:

#### 1. "nodemon: not found"
**Solution:** Change start command to `npm start` instead of `npm run dev`

#### 2. "Cannot connect to database"
**Solution:** Check MongoDB Atlas:
- Whitelist IP `0.0.0.0/0`
- Verify username/password
- Check database name

#### 3. "CORS errors"
**Solution:** Update environment variables:
```bash
FRONTEND_URL=https://your-frontend-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
```

#### 4. "Port already in use"
**Solution:** Render automatically sets `PORT` environment variable. Your app should use:
```javascript
const PORT = process.env.PORT || 3000;
```

### 4. Health Check
After deployment, test these endpoints:
- `https://your-app.onrender.com/health` - Should return server status
- `https://your-app.onrender.com/api/test` - Should return API test response

## 📱 Frontend Deployment (Vercel/Netlify)

After backend is deployed, update your frontend environment:

```bash
# Frontend .env
VITE_API_URL=https://your-backend-app.onrender.com
VITE_APP_NAME=ShrinkLink
VITE_APP_VERSION=1.0.0
```

## 🔒 Security Checklist

- [ ] Strong JWT secret (32+ characters)
- [ ] MongoDB Atlas IP whitelisting
- [ ] CORS properly configured
- [ ] Environment variables set in Render
- [ ] HTTPS enabled (automatic on Render)
- [ ] Rate limiting enabled
- [ ] Input validation enabled

## 📊 Monitoring

After deployment, monitor:
- **Render Logs:** Check for any runtime errors
- **Database Connections:** Monitor MongoDB Atlas metrics
- **API Response Times:** Test endpoint performance
- **Error Rates:** Watch for 4xx/5xx responses

## 🚀 Next Steps

1. **Fix current deployment** with the quick fix above
2. **Test all endpoints** after successful deployment
3. **Deploy frontend** with correct backend URL
4. **Set up custom domain** (optional)
5. **Configure monitoring** and alerts

---

**Need help?** Check the Render logs for specific error messages and refer to this guide for solutions.
