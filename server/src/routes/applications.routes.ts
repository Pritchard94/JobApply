import { Router } from "express";
import * as appController from "../controllers/applications.controller.js";

const router = Router();

router.get("/", appController.listApplications);
router.get("/stats", appController.getApplicationStats);
router.get("/:id", appController.getApplication);
router.put("/:id/status", appController.updateApplicationStatus);
router.put("/:id/notes", appController.updateApplicationNotes);

export { router as applicationsRoutes };
