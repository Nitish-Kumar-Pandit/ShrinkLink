import { createUser, findUserByEmail, findUserByEmailAndPassword } from "../dao/user.dao.js";
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
    const user = await findUserByEmailAndPassword(email);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = signToken({id: user._id});
    return {token, user};
}