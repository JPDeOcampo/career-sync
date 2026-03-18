import express from "express";
import multer from "multer";
import {
  uploadDocumentController,
  getDocumentController,
} from "@/controllers/document/documentController";
import { protect } from "@/middleware/authenticate";
import { authLimiter } from "@/middleware/rateLimiters";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  protect,
  authLimiter,
  upload.single("file"),
  uploadDocumentController,
);

router.get("/", protect, authLimiter, getDocumentController);

export default router;
