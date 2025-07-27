# 🔗 Update Short URL Domain to https://sl.nitishh.in/

## ✅ **Changes Applied**

I've updated your ShrinkLink application to use `https://sl.nitishh.in/` as the short URL domain instead of the backend URL.

### 🔧 **Files Modified:**

1. **`BACKEND/src/controller/short_url.controller.js`**
   - Updated all short URL generation to use `https://sl.nitishh.in`
   - Added `SHORT_URL_DOMAIN` environment variable support
   - Fallback chain: `SHORT_URL_DOMAIN` → `https://sl.nitishh.in` → `APP_URL` → `FRONTEND_URL`

2. **`BACKEND/.env`**
   - Added `SHORT_URL_DOMAIN=https://sl.nitishh.in`

3. **`render-backend.yaml`**
   - Added `SHORT_URL_DOMAIN` environment variable for deployment

## 🚀 **Deployment Steps**

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Update short URL domain to https://sl.nitishh.in"
git push origin main
```

### Step 2: Update Backend Environment Variables on Render

Go to your backend service on Render and add this environment variable:

```bash
SHORT_URL_DOMAIN=https://sl.nitishh.in
```

**Important**: Add this to your existing environment variables, don't replace them.

### Step 3: Redeploy Backend Service
1. Go to your backend service on Render
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete

### Step 4: Test the Changes

#### Test 1: Create a New Short URL
1. Go to your frontend: `https://shrinklink-2.onrender.com`
2. Create a new short URL
3. **Expected Result**: The generated short URL should show `https://sl.nitishh.in/abc123` instead of `https://shrinklink-tojj.onrender.com/abc123`

#### Test 2: Verify Backend Health
```bash
curl https://shrinklink-tojj.onrender.com/health
```

#### Test 3: Test Short URL Creation via API
```bash
curl -X POST https://shrinklink-tojj.onrender.com/api/create \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "expiration": "14d"}'
```

**Expected Response**:
```json
{
  "success": true,
  "shortUrl": "https://sl.nitishh.in/abc123",
  "status": "active",
  "expiresAt": "2025-02-10T..."
}
```

## 🌐 **Domain Configuration Required**

### Step 5: Configure DNS for sl.nitishh.in

You need to set up DNS records to point `sl.nitishh.in` to your backend service:

#### Option A: CNAME Record (Recommended)
```
Type: CNAME
Name: sl
Value: shrinklink-tojj.onrender.com
TTL: 300
```

#### Option B: A Record
```
Type: A
Name: sl
Value: [Render IP address]
TTL: 300
```

### Step 6: Add Custom Domain to Render Backend

1. Go to your backend service on Render
2. Go to Settings → Custom Domains
3. Add domain: `sl.nitishh.in`
4. Follow Render's instructions for domain verification

## 🔍 **How It Works Now**

### Before (Using Backend URL):
- User creates URL → Backend returns: `https://shrinklink-tojj.onrender.com/abc123`
- User clicks link → Goes to backend → Redirects to original URL

### After (Using Custom Domain):
- User creates URL → Backend returns: `https://sl.nitishh.in/abc123`
- User clicks link → Goes to your custom domain → Backend handles redirect

## 🎯 **Benefits**

1. **Professional URLs**: `sl.nitishh.in/abc123` instead of long Render URLs
2. **Branding**: Your custom domain for all short links
3. **Consistency**: All short URLs use the same domain
4. **SEO Friendly**: Better for link sharing and analytics

## 🚨 **Important Notes**

### Existing Short URLs
- **Old URLs** (created before this update) will still use the backend domain
- **New URLs** (created after this update) will use `https://sl.nitishh.in`
- Both will continue to work as long as the backend is running

### Domain Setup
- The domain `sl.nitishh.in` must point to your backend service
- Until DNS is configured, the short URLs will show the custom domain but may not resolve
- You can test with the backend URL directly: `https://shrinklink-tojj.onrender.com/abc123`

## 🧪 **Testing Checklist**

- [ ] Backend deployed with new environment variable
- [ ] New short URLs show `https://sl.nitishh.in/` domain
- [ ] Existing short URLs still work
- [ ] Frontend displays new domain correctly
- [ ] QR codes generate with new domain
- [ ] Copy/paste functionality works with new URLs

## 🔄 **Rollback Plan**

If you need to rollback:
1. Remove `SHORT_URL_DOMAIN` environment variable from Render
2. Redeploy backend service
3. Short URLs will revert to using backend domain

---

**Your short URLs will now use the professional domain `https://sl.nitishh.in/`!** 🎉

Remember to configure DNS to point `sl.nitishh.in` to your backend service for the links to work properly.
