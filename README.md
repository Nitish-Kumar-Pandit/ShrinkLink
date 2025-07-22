# ShrinkLink - URL Shortener

A modern, feature-rich URL shortener application built with React 19, Node.js, Express, and MongoDB. ShrinkLink provides a secure and efficient way to create, manage, and track shortened URLs with a beautiful glassmorphic UI design.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

### Technologies Used
- **Frontend**: React 19, Redux Toolkit, TanStack Router, TanStack Query, Tailwind CSS
- **Backend**: Node.js, Express 5, MongoDB with Mongoose
- **Security**: JWT, bcrypt, Helmet, CORS, rate limiting, input validation
- **Tools**: Vite, ESLint

### 1. Start MongoDB
```powershell
# Option 1: Use the provided script
.\start-mongodb.ps1

# Option 2: Manual start
& "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

### 2. Start Backend Server
```bash
cd BACKEND
npm install
npm start
# or
node app.js
```

### 3. Start Frontend Development Server
```bash
cd FRONTEND
npm install
npm run dev
```

## 📁 Project Structure

```
ShrinkLink/
├── BACKEND/                 # Express.js API server
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controller/      # Route controllers
│   │   ├── dao/             # Data access objects
│   │   ├── middleware/      # Custom middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── .env                 # Environment variables
│   ├── .env.example         # Example environment variables
│   └── app.js               # Main server file
├── FRONTEND/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Redux store & slices
│   │   ├── api/             # API functions
│   │   ├── routing/         # TanStack Router setup
│   │   ├── pages/           # Page components
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   ├── docs/                # Documentation
│   └── index.html           # HTML entry point
├── DEPLOYMENT_GUIDE.md      # Deployment instructions
├── FEATURE_ROADMAP.md       # Future feature plans
├── start-mongodb.ps1        # MongoDB startup script
├── stop-mongodb.ps1         # MongoDB stop script
└── README.md                # This file
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```
# Required Variables
MONGO_URI=mongodb://localhost:27017/shrinklink
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
PORT=3000
FRONTEND_URL=http://localhost:5173

# Optional Variables
DEFAULT_URL_EXPIRY_DAYS=365
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=development
```

### Frontend Configuration
- Development server runs on `http://localhost:5173` or `http://localhost:5174`
- API calls are configured to target the backend URL
- Environment variables can be set in `.env` files for different environments:
  - `.env` - Default environment variables
  - `.env.development` - Development-specific variables
  - `.env.production` - Production-specific variables

## 🌟 Features

### ✅ Completed Features
- **User Authentication**: Register, login, logout with JWT tokens and secure cookie-based sessions
- **URL Shortening**: Create short URLs from long URLs with custom slugs
- **URL Redirection**: Fast and secure redirection from short URLs to original URLs
- **Anonymous User Support**: Create up to 3 links without registration (IP-based limits)
- **QR Code Generation**: Generate and download QR codes for your shortened URLs
- **Click Tracking & Analytics**: Track and analyze clicks on your shortened URLs
- **User Dashboard**: Manage all your shortened URLs in one place
- **Glassmorphic UI Design**: Modern, clean interface with glassmorphism effects
- **Security Features**: Comprehensive security with Helmet, CORS, rate limiting, and input validation
- **Error Handling**: Robust error handling and user feedback
- **Responsive Design**: Fully responsive across all devices
- **Offline Support**: Basic functionality when offline

### 🔄 API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

#### URL Management
- `POST /api/create` - Create short URL
- `GET /api/urls` - Get all URLs for logged-in user
- `GET /api/stats` - Get usage statistics for logged-in user
- `GET /:shortId` - Redirect to original URL

## 🛠️ Development

### Starting Development Environment
1. **Start MongoDB**: `.\start-mongodb.ps1`
2. **Start Backend**: `cd BACKEND && npm start`
3. **Start Frontend**: `cd FRONTEND && npm run dev`

### Database Management
```bash
# Connect to MongoDB shell
mongosh shrinklink

# View users
db.users.find().pretty()

# View URLs
db.shorturls.find().pretty()

# Clear all data
db.users.deleteMany({})
db.shorturls.deleteMany({})
```

## 🐛 Troubleshooting

### Database Connection Issues
1. **MongoDB not running**: Run `.\start-mongodb.ps1`
2. **Data directory missing**: Script will create `C:\data\db` automatically
3. **Permission issues**: Run PowerShell as Administrator

### Common Errors
- **"Database connection failed"**: Ensure MongoDB is running
- **"Port already in use"**: Change port in .env or kill existing process
- **"Module not found"**: Run `npm install` in respective directory

## 📝 Usage Examples

### Register a User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Create Short URL
```javascript
POST /api/create
{
  "url": "https://www.example.com/very/long/url"
}
```

### Response
```javascript
{
  "shortUrl": "http://localhost:3000/abc123"
}
```

## 🔒 Security Features
- **Password Hashing**: Secure password storage with bcrypt
- **JWT Authentication**: Secure authentication with HTTP-only cookies
- **CORS Protection**: Configured Cross-Origin Resource Sharing
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Helmet Integration**: HTTP header security
- **XSS Protection**: Cross-site scripting protection
- **MongoDB Sanitization**: NoSQL injection protection
- **Secure Error Handling**: No leakage of sensitive information
- **HTTP Parameter Pollution Protection**: Prevents parameter pollution attacks
- **Content Security Policy**: Restricts resource loading

## 🎯 Next Steps
Check out our detailed [Feature Roadmap](./FEATURE_ROADMAP.md) for upcoming features. Key priorities include:

### High Priority
- **Analytics Dashboard**: Comprehensive analytics with charts, geographic data, and referrer tracking
- **Advanced URL Management**: Edit destinations, set expiration dates, bulk operations, and categories/tags
- **Custom Domains**: Allow users to use their own domains for short URLs
- **API Access**: RESTful API for developers with API key management

### Medium Priority
- **Link-in-Bio Pages**: Create landing pages with multiple links
- **Team Collaboration**: Multi-user workspace management
- **Advanced Security**: Password-protected URLs, link expiration, and malware detection
- **Branded Short URLs**: Custom URL patterns and branded QR codes

## 🚢 Deployment

For detailed deployment instructions, please refer to our [Deployment Guide](./DEPLOYMENT_GUIDE.md). The guide covers:

- Production readiness checklist
- Environment setup
- Docker deployment
- Cloud deployment options (Vercel, Railway, Netlify, Heroku, AWS)
- Security considerations
- Monitoring and logging
- Performance optimization
- CI/CD pipeline setup

---

**Happy URL Shortening! 🎉**
