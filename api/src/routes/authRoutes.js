import express from "express";
import { AuthController } from "../controllers/authController.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", requireAuth, AuthController.me);

export default router;
