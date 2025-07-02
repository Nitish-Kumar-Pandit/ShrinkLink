import jsonwebtoken from "jsonwebtoken";
import user from "../models/user.model.js";
import { createUser, findUserByEmail } from "../dao/user.dao.js";
import { signToken } from "../utils/helper.js";

export const registerUserService = async (name, email, password) => {
    // Check if email already exists
    const existingUserByEmail = await findUserByEmail(email);
    if (existingUserByEmail) {
        throw new Error("User already exists");
    }

    const newUser = await createUser(name, email, password);
    const token = signToken({id: newUser._id});
    return { user: newUser, token };
}

export const loginUserService = async (email, password) => {
    const user = await findUserByEmail(email);

    if (!user ||user.password !== password) {
        throw new Error("Invalid username or password");
    }
    const token = signToken({id: user._id});
    return {token, user};
}