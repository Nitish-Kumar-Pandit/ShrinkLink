import express from "express";
import { registerUser, loginUser, logoutUser, testCookie } from "../controller/auth.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/test-cookie", testCookie);

export default router;