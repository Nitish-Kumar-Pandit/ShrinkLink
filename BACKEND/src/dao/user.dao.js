import User from "../models/user.model.js";

export const findUserByEmail = async (email) => {
    return await User.findOne({ email });
}

export const findUserByEmailAndPassword = async (email) => {
    return await User.findOne({ email }).select('+password');
}

export const findUserByUsername = async (username) => {
    return await User.findOne({ username });
}

export const findUserById = async (id) => {
    return await User.findById(id);
}

export const createUser = async (name, email, password) => {
    try {
        const newUser = new User({
            username: name,
            email: email,
            password: password
        });
        await newUser.save();
        return newUser;
    } catch (error) {
        // Handle MongoDB duplicate key errors (only for email now)
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.email) {
                throw new Error("Email already exists");
            }
            // For any other duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
        }
        throw error;
    }
}