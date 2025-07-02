import { loginUserService, registerUserService } from "../services/auth.service.js";

export const registerUser = async (req, res) => {
    try {
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
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });
        req.user = user;
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = result.user.toObject();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token: result.token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const {token, user} = await loginUserService(email, password);
    req.user = user;
    res.cookie("accessToken", token);
    res.status(200).json({
        success: true,
        message: "Login successful",
        token: token
    });
}