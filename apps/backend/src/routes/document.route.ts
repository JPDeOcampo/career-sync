import express from "express";
import multer from "multer";
import {
  uploadDocumentController,
  getDocumentController,
  deleteDocumentController,
  getCleanedURLDocument,
} from "@/controllers/document/document.controller";
import { protect } from "@/middleware/authenticate.middleware";
import { authLimiter } from "@/middleware/rate-limiters.middleware";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  protect,
  authLimiter,
  upload.single("file"),
  uploadDocumentController,
);

router.get("/", protect, authLimiter, getDocumentController);
router.delete("/delete", protect, authLimiter, deleteDocumentController);

router.get("/:userId/:filename", authLimiter, getCleanedURLDocument);

export default router;
