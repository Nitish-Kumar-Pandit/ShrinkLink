import jsonwebtoken from "jsonwebtoken";
import { nanoid } from "nanoid";

export const generateNanoId = () => {
    return nanoid(4); 
}

export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_SECRET, {expiresIn: "5m"});
}

export const verifyToken = (token) => {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    console.log(decoded.id)
    return decoded;
}