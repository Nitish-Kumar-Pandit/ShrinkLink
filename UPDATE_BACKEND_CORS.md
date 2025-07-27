# 🔄 Update Backend CORS After Frontend Deployment

## 📍 **Current Status**
- ✅ Backend deployed: `https://shrinklink-p8mk.onrender.com`
- 🔄 Frontend deploying: Will get URL after successful deployment

## 🎯 **Action Required After Frontend Deploys**

### Step 1: Get Frontend URL
After your frontend deploys successfully, you'll get a URL like:
`https://shrinklink-frontend-xyz.onrender.com`

### Step 2: Update Backend Environment Variables

Go to your backend service on Render (`shrinklink-p8mk`) and update these environment variables:

```bash
# Replace with your actual frontend URL
FRONTEND_URL=https://your-actual-frontend-url.onrender.com
CORS_ORIGIN=https://your-actual-frontend-url.onrender.com
```

### Step 3: Redeploy Backend
After updating the environment variables:
1. Go to your backend service
2. Click "Manual Deploy" → "Deploy latest commit"
3. This will restart the backend with the new CORS settings

## 🔧 **Complete Backend Environment Variables**

Your backend should have these environment variables set:

```bash
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
PORT=10000
MONGO_URI=mongodb+srv://compilex-admin:CompileX2024@compilex.jhtzhys.mongodb.net/shrinklink?retryWrites=true&w=majority&appName=CompileX
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
APP_URL=https://shrinklink-p8mk.onrender.com
FRONTEND_ROUTES=auth,register,dashboard,analytics-demo,test-redirect

# UPDATE THESE AFTER FRONTEND DEPLOYS:
FRONTEND_URL=https://your-frontend-url.onrender.com
CORS_ORIGIN=https://your-frontend-url.onrender.com
```

## 🧪 **Test CORS Configuration**

After updating, test that CORS is working:

1. **Open browser console** on your frontend
2. **Try creating a short URL**
3. **Check for CORS errors** in console
4. **Should see successful API calls** to backend

## 🎯 **Expected Flow**

1. ✅ Backend deployed and healthy
2. 🔄 Frontend deploys with correct build command
3. 🔄 Update backend CORS with frontend URL
4. 🔄 Test full application functionality
5. ✅ Both services working together

---

**Remember to update the backend CORS settings after your frontend gets its URL!** 🎯
