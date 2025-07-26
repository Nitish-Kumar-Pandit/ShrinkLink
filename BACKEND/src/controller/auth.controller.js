import { loginUserService, registerUserService } from "../services/auth.service.js";
import { cookieOptions } from "../config/config.js";
import { validationResult } from 'express-validator';

export const registerUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const {name, email, password} = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        const result = await registerUserService(name, email, password);

        // Set JWT token as HTTP-only cookie
        res.cookie('accessToken', result.token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = result.user.toObject();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: result.token,
            user: {
                id: userWithoutPassword._id,
                username: userWithoutPassword.username,
                email: userWithoutPassword.email,
                avatar: userWithoutPassword.avatar,
                createdAt: userWithoutPassword.createdAt,
                avatarUrl: userWithoutPassword.avatarUrl
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
}

// Test endpoint to check cookies
export const testCookie = async (req, res) => {
    // Set a simple test cookie
    res.cookie('testCookie', 'testValue', {
        httpOnly: false, // Make it visible in browser for testing
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000, // 1 hour
        path: '/'
    });

    res.json({
        success: true,
        message: 'Test cookie set',
        cookies: req.cookies
    });
};

export const loginUser = async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const {token, user} = await loginUserService(email, password);

        // Set JWT token as HTTP-only cookie
        res.cookie("accessToken", token, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            path: '/'
        });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
}

export const logoutUser = async (req, res) => {
    try {
        // Clear the access token cookie
        res.clearCookie('accessToken', {
            ...cookieOptions,
            maxAge: 0
        });

        res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
}