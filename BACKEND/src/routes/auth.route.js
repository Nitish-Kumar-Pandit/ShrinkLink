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
    res.status(200).json({
        success: true,
        user: req.user
    });
});

export default router;