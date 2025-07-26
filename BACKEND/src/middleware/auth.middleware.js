import { verifyToken } from "../utils/helper.js";
import { findUserById } from "../dao/user.dao.js";

export const authmiddleware = async (req, res, next) => {
    try {
        // Try to get token from cookies first, then from Authorization header
        let token = req.cookies.accessToken;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            console.log('Auth middleware: No token found');
            console.log('Cookies:', req.cookies);
            console.log('Authorization header:', req.headers.authorization);
            return res.status(401).json({
                success: false,
                message: "Access token not found"
            });
        }

        const decoded = verifyToken(token);
        const user = await findUserById(decoded.id);

        if (!user) {
            console.log('Auth middleware: User not found for ID:', decoded.id);
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;
        next();
    } catch(error) {
        console.log('Auth middleware error:', error.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}
