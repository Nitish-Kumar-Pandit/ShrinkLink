import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generateGravatarUrl } from "../utils/gravatar.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [2, 'Username must be at least 2 characters'],
        maxlength: [50, 'Username cannot exceed 50 characters'],
        match: [/^[a-zA-Z\s]+$/, 'Username can only contain letters and spaces']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: [254, 'Email cannot exceed 254 characters'],
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        },
        index: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        maxlength: [128, 'Password cannot exceed 128 characters'],
        select: false,
        validate: {
            validator: function(v) {
                // Password strength validation
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
            },
            message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
        }
    },
    avatar: {
        type: String,
        required: false,
        default: "",
        maxlength: [500, 'Avatar URL cannot exceed 500 characters'],
        validate: {
            validator: function(v) {
                if (!v) return true; // Optional field
                try {
                    new URL(v);
                    return true;
                } catch {
                    return false;
                }
            },
            message: 'Please provide a valid avatar URL'
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    indexes: [
        { email: 1 }, // Primary lookup
        { username: 1 }, // Username search
        { isActive: 1 }, // Active users
        { createdAt: -1 }, // Recent users
        { lastLogin: -1 } // Recent activity
    ]
});

// Virtual field to get avatar URL (custom avatar or Gravatar)
userSchema.virtual('avatarUrl').get(function() {
    if (this.avatar && this.avatar !== '') {
        return this.avatar;
    }
    return generateGravatarUrl(this.email, { size: 200, default: 'identicon' });
});

// Ensure virtual fields are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.set('toJSON', {
    transform: function(doc, ret){
        delete ret.password;
        delete ret.__v;
        return ret;
    }
})

// Pre-save middleware to hash password and set Gravatar
userSchema.pre('save', async function(next) {
    // Hash password if it's modified
    if (this.isModified('password')) {
        try {
            const saltRounds = 10;
            this.password = await bcrypt.hash(this.password, saltRounds);
        } catch (error) {
            return next(error);
        }
    }

    // Set Gravatar as default avatar if none provided
    if (!this.avatar || this.avatar === '') {
        this.avatar = generateGravatarUrl(this.email, { size: 200, default: 'identicon' });
    }

    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $unset: { lockUntil: 1 },
            $set: { loginAttempts: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: new Date() }
    });
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function(email) {
    return this.findOne({ email: email.toLowerCase(), isActive: true }).select('+password');
};

const User = mongoose.model("User", userSchema);
export default User;