# ShrinkLink - URL Shortener

A modern URL shortener application built with React, Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn

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
│   │   ├── controller/      # Route controllers
│   │   ├── dao/            # Data access objects
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── .env                # Environment variables
│   └── app.js              # Main server file
├── FRONTEND/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store & slices
│   │   ├── api/            # API functions
│   │   ├── routing/        # React Router setup
│   │   └── utils/          # Utility functions
│   └── package.json
├── start-mongodb.ps1       # MongoDB startup script
├── stop-mongodb.ps1        # MongoDB stop script
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables (.env)
```
MONGO_URI=mongodb://localhost:27017/shrinklink
APP_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
PORT=5000
```

### Frontend Configuration
- Development server runs on `http://localhost:5173` or `http://localhost:5174`
- API calls are made to `http://localhost:3000`

## 🌟 Features

### ✅ Completed Features
- **User Authentication**: Register, login, logout with JWT tokens
- **URL Shortening**: Create short URLs from long URLs
- **URL Redirection**: Redirect short URLs to original URLs
- **User Management**: Secure user data with password hashing
- **Redux State Management**: Centralized state management
- **Responsive UI**: Modern, clean interface
- **Error Handling**: Comprehensive error handling
- **Database Integration**: MongoDB with Mongoose

### 🔄 API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

#### URL Management
- `POST /api/create` - Create short URL
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
- Password hashing with bcrypt
- JWT authentication with HTTP-only cookies
- CORS protection
- Input validation
- Secure error handling

## 🎯 Next Steps
- Add URL analytics and click tracking
- Implement custom URL slugs
- Add URL expiration dates
- Create user dashboard
- Add bulk URL operations

---

**Happy URL Shortening! 🎉**
