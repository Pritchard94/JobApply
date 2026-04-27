import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";

const router = Router();

router.get("/", settingsController.getSettings);
router.put("/", settingsController.updateSettings);
router.put("/auto-apply", settingsController.updateAutoApply);

export { router as settingsRoutes };
