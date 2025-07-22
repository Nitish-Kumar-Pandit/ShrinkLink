// Database abstraction layer
// This allows switching between MongoDB (local) and in-memory storage (production)

let storage = {
  urls: [],
  users: []
};

// Simple in-memory database for demo purposes
export const InMemoryDB = {
  // URL operations
  async createUrl(urlData) {
    const newUrl = {
      id: Date.now().toString(),
      short_code: urlData.short_code,
      full_url: urlData.full_url,
      user_id: urlData.user_id || null,
      clientIP: urlData.clientIP || null,
      clicks: 0,
      is_favorite: false,
      expires_at: urlData.expires_at,
      created_at: new Date(),
      updated_at: new Date()
    };
    storage.urls.push(newUrl);
    return newUrl;
  },

  async findUrlByShortCode(shortCode) {
    return storage.urls.find(url => 
      url.short_code.toLowerCase() === shortCode.toLowerCase()
    );
  },

  async updateUrlClicks(shortCode) {
    const url = await this.findUrlByShortCode(shortCode);
    if (url) {
      url.clicks += 1;
      url.updated_at = new Date();
    }
    return url;
  },

  async getUserUrls(userId) {
    return storage.urls.filter(url => url.user_id === userId);
  },

  async getAllUrls() {
    return storage.urls.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  // User operations
  async createUser(userData) {
    const newUser = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      password: userData.password, // In real app, this should be hashed
      avatar: userData.avatar || '',
      avatarUrl: userData.avatarUrl || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    storage.users.push(newUser);
    return newUser;
  },

  async findUserByEmail(email) {
    return storage.users.find(user => user.email === email);
  },

  async findUserById(id) {
    return storage.users.find(user => user.id === id);
  },

  // Utility
  async getStats() {
    return {
      totalUrls: storage.urls.length,
      totalUsers: storage.users.length,
      totalClicks: storage.urls.reduce((sum, url) => sum + url.clicks, 0)
    };
  }
};

// MongoDB connection (for local development)
let mongoose;
let UrlModel;
let UserModel;

export const MongoDB = {
  async connect() {
    if (!mongoose) {
      mongoose = await import('mongoose');
      
      // URL Schema
      const urlSchema = new mongoose.Schema({
        short_code: { type: String, required: true, unique: true },
        full_url: { type: String, required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        clicks: { type: Number, default: 0 },
        is_favorite: { type: Boolean, default: false },
        expires_at: { type: Date, required: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now }
      });

      // User Schema
      const userSchema = new mongoose.Schema({
        username: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        avatar: { type: String, default: '' },
        avatarUrl: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      });

      UrlModel = mongoose.models.Url || mongoose.model('Url', urlSchema);
      UserModel = mongoose.models.User || mongoose.model('User', userSchema);

      await mongoose.connect(process.env.MONGO_URI);
    }
  },

  async createUrl(urlData) {
    await this.connect();
    const newUrl = new UrlModel(urlData);
    return await newUrl.save();
  },

  async findUrlByShortCode(shortCode) {
    await this.connect();
    return await UrlModel.findOne({ 
      short_code: { $regex: new RegExp(`^${shortCode}$`, 'i') }
    });
  },

  async updateUrlClicks(shortCode) {
    await this.connect();
    return await UrlModel.findOneAndUpdate(
      { short_code: { $regex: new RegExp(`^${shortCode}$`, 'i') } },
      { $inc: { clicks: 1 }, updated_at: new Date() },
      { new: true }
    );
  },

  async getUserUrls(userId) {
    await this.connect();
    return await UrlModel.find({ user_id: userId }).sort({ created_at: -1 });
  },

  async getAllUrls() {
    await this.connect();
    return await UrlModel.find({}).sort({ created_at: -1 });
  },

  async createUser(userData) {
    await this.connect();
    const newUser = new UserModel(userData);
    return await newUser.save();
  },

  async findUserByEmail(email) {
    await this.connect();
    return await UserModel.findOne({ email });
  },

  async findUserById(id) {
    await this.connect();
    return await UserModel.findById(id);
  }
};

// Database selector - use MongoDB if MONGO_URI is available, otherwise use in-memory
export const DB = process.env.MONGO_URI ? MongoDB : InMemoryDB;
