import { findUserById } from "../dao/user.dao.js";
import { verifyToken } from "./helper.js";

export const attachUser = async (req, res, next) => {
    // Try to get token from cookies first, then from Authorization header
    let token = req.cookies.accessToken;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return next();
    }
    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded.id);
        if (!user) {
            return next();
        }
        req.user = user;
        next();
    } catch(error) {
        return next();
    }
}