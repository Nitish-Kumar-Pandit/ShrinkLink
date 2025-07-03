import mongoose from "mongoose";

const shortUrlSchema = new mongoose.Schema({
    full_url: {
        type: String,
        required: [true, 'Full URL is required'],
        maxlength: [2048, 'URL cannot exceed 2048 characters'],
        validate: {
            validator: function(v) {
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please provide a valid URL'
        }
    },
    short_url: {
        type: String,
        required: [true, 'Short URL is required'],
        unique: true,
        maxlength: [50, 'Short URL cannot exceed 50 characters'],
        match: [/^[a-zA-Z0-9_-]+$/, 'Short URL can only contain letters, numbers, hyphens, and underscores']
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Clicks cannot be negative']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    clientIP: {
        type: String,
        required: false,
        validate: {
            validator: function(v) {
                if (!v) return true; // Optional field

                // Allow localhost and development IPs
                if (v === '127.0.0.1' || v === 'localhost' || v === '::1') {
                    return true;
                }

                // Basic IP validation (IPv4 and IPv6)
                const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
                const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
                const ipv6ShortRegex = /^::1$|^::$/; // Common IPv6 localhost formats

                return ipv4Regex.test(v) || ipv6Regex.test(v) || ipv6ShortRegex.test(v);
            },
            message: 'Please provide a valid IP address'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    expiresAt: {
        type: Date,
        default: null
    },
    isFavorite: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    // Add indexes for better performance
    indexes: [
        { short_url: 1 }, // Primary lookup index
        { user: 1, createdAt: -1 }, // User's URLs sorted by creation date
        { clientIP: 1, user: { $exists: false } }, // Anonymous user tracking
        { createdAt: -1 }, // Recent URLs
        { clicks: -1 }, // Popular URLs
        { isActive: 1, expiresAt: 1 }, // Active and non-expired URLs
        { full_url: 1 }, // Duplicate URL detection
    ]
});

// Compound index for anonymous user limits
shortUrlSchema.index({ clientIP: 1, user: 1 });

// TTL index for expired URLs
shortUrlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware for validation
shortUrlSchema.pre('save', function(next) {
    // Keep original case for short_url - removed lowercase conversion

    // Set expiration date if not set (optional feature for future)
    if (!this.expiresAt && process.env.DEFAULT_URL_EXPIRY_DAYS) {
        const expiryDays = parseInt(process.env.DEFAULT_URL_EXPIRY_DAYS);
        if (expiryDays > 0) {
            this.expiresAt = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000));
        }
    }

    next();
});

// Instance methods
shortUrlSchema.methods.incrementClicks = function() {
    this.clicks += 1;
    return this.save();
};

shortUrlSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < new Date();
};

// Static methods
shortUrlSchema.statics.findActiveByShortUrl = function(shortUrl) {
    return this.findOne({
        short_url: shortUrl, // Keep original case
        isActive: true,
        $or: [
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });
};

shortUrlSchema.statics.getAnonymousCount = function(clientIP) {
    return this.countDocuments({
        clientIP: clientIP,
        user: { $exists: false },
        isActive: true
    });
};

const ShortUrl = mongoose.model("ShortUrl", shortUrlSchema);
export default ShortUrl;