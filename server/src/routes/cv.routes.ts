import { Router } from "express";
import multer from "multer";
import * as cvController from "../controllers/cv.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const router = Router();

router.post("/upload", upload.single("cv"), cvController.uploadCV);
router.get("/", cvController.listCVs);
router.get("/:id", cvController.getCV);
router.delete("/:id", cvController.deleteCV);
router.post("/:id/set-primary", cvController.setPrimaryCV);

export { router as cvRoutes };
