import { Router } from "express";
import { applyLimiter } from "../middleware/rateLimiter.js";
import * as jobsController from "../controllers/jobs.controller.js";

const router = Router();

router.get("/", jobsController.listJobs);
router.get("/stats", jobsController.getJobStats);
router.get("/:id", jobsController.getJob);
router.post("/:id/dismiss", jobsController.dismissJob);
router.post("/:id/apply", applyLimiter, jobsController.applyToJob);

export { router as jobsRoutes };
