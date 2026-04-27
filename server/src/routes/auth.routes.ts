import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Gmail OAuth - initiate (requires auth to know which user)
router.get("/gmail", authMiddleware, authController.initiateGmailOAuth);

// Gmail OAuth - callback (public, state contains user info)
router.get("/gmail/callback", authController.handleGmailCallback);

// Gmail status & disconnect (requires auth)
router.get("/gmail/status", authMiddleware, authController.getGmailStatus);
router.delete("/gmail", authMiddleware, authController.disconnectGmail);

export { router as authRoutes };
