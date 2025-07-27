# 🚀 ShrinkLink Render Deployment Guide

## 📋 Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **MongoDB Atlas**: Set up a MongoDB database
3. **Render Account**: Create account at [render.com](https://render.com)

## 🗄️ Phase 1: Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account and cluster

### 2. Configure Database
```bash
# Database Name: shrinklink
# Collection: shorturls, users
```

### 3. Get Connection String
- Go to "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your actual password

### 4. Configure Network Access
- Go to "Network Access"
- Add IP Address: `0.0.0.0/0` (Allow access from anywhere)

## 🔙 Phase 2: Backend Deployment

### 1. Create Backend Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `Nitish-Kumar-Pandit/ShrinkLink`

### 2. Backend Configuration
```yaml
Name: shrinklink-backend
Region: Oregon (or closest to your users)
Branch: main
Root Directory: BACKEND
Runtime: Node
Build Command: npm install
Start Command: npm start
```

### 3. Environment Variables for Backend
Add these in Render's Environment Variables section:

```bash
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
PORT=10000
MONGO_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/shrinklink?retryWrites=true&w=majority
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
FRONTEND_ROUTES=auth,register,dashboard,analytics-demo,test-redirect
```

### 4. Deploy Backend
- Click "Create Web Service"
- Wait for deployment to complete
- Note the backend URL: `https://your-backend-service.onrender.com`

## 🔜 Phase 3: Frontend Deployment

### 1. Create Frontend Static Site
1. Go to Render Dashboard → "New" → "Static Site"
2. Connect the same repository: `Nitish-Kumar-Pandit/ShrinkLink`

### 2. Frontend Configuration
```yaml
Name: shrinklink-frontend
Branch: main
Root Directory: FRONTEND
Build Command: npm install && npm run build
Publish Directory: dist
```

### 3. Environment Variables for Frontend
```bash
NODE_ENV=production
VITE_API_URL=https://your-backend-service.onrender.com
VITE_BACKEND_URL=https://your-backend-service.onrender.com
VITE_APP_NAME=ShrinkLink
VITE_APP_VERSION=1.0.0
```

### 4. Deploy Frontend
- Click "Create Static Site"
- Wait for deployment to complete
- Note the frontend URL: `https://your-frontend-service.onrender.com`

## 🔄 Phase 4: Update Cross-References

### 1. Update Backend Environment Variables
Go back to your backend service and update:
```bash
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
CORS_ORIGIN=https://your-actual-frontend-url.onrender.com
```

### 2. Update Frontend Environment Variables
Go to your frontend service and update:
```bash
VITE_API_URL=https://your-actual-backend-url.onrender.com
VITE_BACKEND_URL=https://your-actual-backend-url.onrender.com
```

### 3. Redeploy Both Services
- Trigger manual deploy for both services after updating environment variables

## ✅ Phase 5: Testing

### 1. Test Backend Health
Visit: `https://your-backend-service.onrender.com/health`
Should return:
```json
{
  "status": "OK",
  "message": "ShrinkLink Backend API is healthy!",
  "environment": "production"
}
```

### 2. Test Frontend
Visit: `https://your-frontend-service.onrender.com`
- Should load the ShrinkLink homepage
- Try creating a short URL
- Test the redirect functionality

### 3. Test Short URL Redirect
- Create a short URL through the frontend
- Visit the short URL directly: `https://your-backend-service.onrender.com/abc123`
- Should redirect to the original URL

## 🔧 Phase 6: Custom Domain (Optional)

### 1. For Frontend
- Go to your frontend service → Settings → Custom Domains
- Add your domain: `sl.nitishh.in`
- Update DNS records as instructed

### 2. For Backend
- Go to your backend service → Settings → Custom Domains
- Add your domain: `api.nitishh.in`
- Update DNS records as instructed

### 3. Update Environment Variables
After setting up custom domains, update:
```bash
# Backend
FRONTEND_URL=https://sl.nitishh.in
CORS_ORIGIN=https://sl.nitishh.in
APP_URL=https://api.nitishh.in

# Frontend
VITE_API_URL=https://api.nitishh.in
VITE_BACKEND_URL=https://api.nitishh.in
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
- Check FRONTEND_URL and CORS_ORIGIN in backend
- Ensure frontend is using correct backend URL

#### 2. Database Connection Failed
- Verify MONGO_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

#### 3. Short URLs Not Redirecting
- Check backend logs for errors
- Verify /:shortCode route is working
- Test with backend URL directly

#### 4. Frontend Build Fails
- Check if all dependencies are in package.json
- Verify environment variables are set correctly
- Check build logs for specific errors

### Debug Commands
```bash
# Check backend health
curl https://your-backend-service.onrender.com/health

# Test API endpoint
curl https://your-backend-service.onrender.com/api/redirect/test123

# Check frontend build
npm run build
```

## 📊 Monitoring

### 1. Render Dashboard
- Monitor service health and logs
- Check deployment history
- View metrics and usage

### 2. Application Logs
- Backend logs show API requests and database operations
- Frontend console shows API calls and errors

## 🎉 Success Checklist

- [ ] Backend deployed and health check passes
- [ ] Frontend deployed and loads correctly
- [ ] Database connection working
- [ ] CORS configured properly
- [ ] Short URL creation works
- [ ] Short URL redirection works
- [ ] Authentication system works
- [ ] Custom domains configured (if applicable)

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection
5. Review this guide for missed steps

---

**🎯 Your ShrinkLink application should now be fully deployed and functional on Render!**
