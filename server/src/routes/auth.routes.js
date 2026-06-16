import { Router } from "express";
import { login, register, verifyEmail, getMe, logout } from "../controller/auth.controller.js";
import { registerRules, loginRules, validateRequest } from "../validators/auth.validator.js";
import {authUser} from "../middleware/auth.middleware.js";
const authRouter = Router();

authRouter.post("/register", registerRules, validateRequest, register);

authRouter.get("/verify-email", verifyEmail);

authRouter.post("/login", loginRules, validateRequest, login);
authRouter.get("/get-me", authUser, getMe);
authRouter.post("/logout", logout);

export default authRouter;
