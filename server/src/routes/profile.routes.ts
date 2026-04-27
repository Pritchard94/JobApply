import { Router } from "express";
import { validate } from "../middleware/validate.js";
import * as profileController from "../controllers/profile.controller.js";
import { z } from "zod";

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  job_titles: z.array(z.string().min(1)).min(1),
  locations: z.array(z.string()).default([]),
  remote_only: z.boolean().default(false),
  job_types: z.array(z.string()).default([]),
  salary_min: z.number().int().positive().optional(),
  salary_max: z.number().int().positive().optional(),
  salary_currency: z.string().default("USD"),
  keywords: z.array(z.string()).default([]),
  excluded_companies: z.array(z.string()).default([]),
  search_frequency: z.enum(["daily", "twice_daily", "weekly"]).default("daily"),
});

const updateProfileSchema = createProfileSchema.partial().extend({
  is_active: z.boolean().optional(),
});

const router = Router();

router.post(
  "/",
  validate({ body: createProfileSchema }),
  profileController.createProfile,
);
router.get("/", profileController.listProfiles);
router.get("/:id", profileController.getProfile);
router.put(
  "/:id",
  validate({ body: updateProfileSchema }),
  profileController.updateProfile,
);
router.delete("/:id", profileController.deleteProfile);
router.post("/:id/search-now", profileController.triggerSearch);

export { router as profileRoutes };
