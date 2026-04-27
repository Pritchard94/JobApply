import { Router } from "express";
import * as notifController from "../controllers/notifications.controller.js";

const router = Router();

router.post("/subscribe", notifController.subscribePush);
router.delete("/subscribe", notifController.unsubscribePush);
router.get("/preferences", notifController.getPreferences);
router.put("/preferences", notifController.updatePreferences);

export { router as notificationsRoutes };
