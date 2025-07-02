import { verifyToken } from "../utils/helper";
import { findUserById } from "../dao/user.dao.js";

export const authmiddleware = async (req, res, next) => {

    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
    try {
        const decoded = verifyToken(token);
        const user = await findUserById(decoded);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        req.user = user;
        next();
    } catch(error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}
