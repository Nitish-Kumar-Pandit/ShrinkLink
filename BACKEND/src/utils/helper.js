import jsonwebtoken from "jsonwebtoken";
import { nanoid } from "nanoid";

export const generateNanoId = () => {
    return nanoid(4); 
}

export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {expiresIn: "24h"});
}

export const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log('Token verified successfully for user ID:', decoded.id);
        return decoded;
    } catch (error) {
        console.log('Token verification failed:', error.message);
        throw error;
    }
}