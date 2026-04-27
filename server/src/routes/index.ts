import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { authRoutes } from "./auth.routes.js";
import { cvRoutes } from "./cv.routes.js";
import { profileRoutes } from "./profile.routes.js";
import { jobsRoutes } from "./jobs.routes.js";
import { applicationsRoutes } from "./applications.routes.js";
import { notificationsRoutes } from "./notifications.routes.js";
import { settingsRoutes } from "./settings.routes.js";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Gmail OAuth callback is public (no auth middleware)
router.use("/auth", authRoutes);

// All routes below require authentication
router.use(authMiddleware);
router.use("/cv", cvRoutes);
router.use("/profiles", profileRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/settings", settingsRoutes);

export { router as apiRouter };
