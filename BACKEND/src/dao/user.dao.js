import User from "../models/user.model.js";
import mongoose from "mongoose";

export const findUserByEmail = async (email) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        return await User.findOne({ email }).maxTimeMS(5000);
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

export const findUserByEmailAndPassword = async (email) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        return await User.findOne({ email }).select('+password').maxTimeMS(5000);
    } catch (error) {
        console.error("Error finding user by email and password:", error);
        throw error;
    }
}

export const findUserByUsername = async (username) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        return await User.findOne({ username }).maxTimeMS(5000);
    } catch (error) {
        console.error("Error finding user by username:", error);
        throw error;
    }
}

export const findUserById = async (id) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }
        return await User.findById(id).maxTimeMS(5000);
    } catch (error) {
        console.error("Error finding user by id:", error);
        throw error;
    }
}

export const createUser = async (name, email, password) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }

        const newUser = new User({
            username: name,
            email: email,
            password: password
        });

        await newUser.save();
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);

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