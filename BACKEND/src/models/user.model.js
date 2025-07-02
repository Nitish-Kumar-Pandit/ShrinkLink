import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { generateGravatarUrl } from "../utils/gravatar.js";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: false,
        default: ""
    }
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

const User = mongoose.model("User", userSchema);
export default User;