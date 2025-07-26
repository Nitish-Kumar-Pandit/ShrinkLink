import express from "express";
import { registerUser, loginUser, logoutUser, testCookie } from "../controller/auth.controller.js";
import { authmiddleware } from './../middleware/auth.middleware.js';
import { checkDatabaseConnection } from '../middleware/db.middleware.js';
import { validateRegister, validateLogin, validateRateLimit } from '../middleware/validation.middleware.js';
const router = express.Router();

// Add database connection check to all auth routes
router.use(checkDatabaseConnection);

router.post("/register", validateRateLimit, validateRegister, registerUser);
router.post("/login", validateRateLimit, validateLogin, loginUser);
router.post("/logout", logoutUser);
router.get("/test-cookie", testCookie);
router.get("/me", authmiddleware, (req, res) => {
    console.log('GET /me endpoint hit, user:', req.user?.email);
    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            avatar: req.user.avatar,
            createdAt: req.user.createdAt,
            avatarUrl: req.user.avatarUrl
        }
    });
});

// Test endpoint to check authentication without middleware
router.get("/test-auth", (req, res) => {
    console.log('Test auth endpoint hit');
    console.log('Cookies:', req.cookies);
    console.log('Authorization header:', req.headers.authorization);
    res.status(200).json({
        success: true,
        message: "Test endpoint reached",
        cookies: req.cookies,
        authHeader: req.headers.authorization
    });
});

export default router;