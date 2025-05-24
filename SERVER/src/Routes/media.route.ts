import express from "express";
import {
  uploadMedia,
  getMedia,
  deleteMedia,
  getMediaById,
  downloadMediaFile,
} from "../Controller/media.controller";
import { protect } from "../Middleware/auth.middleware";
import { upload } from "../Middleware/upload.middleware";

const router = express.Router();

// Route to upload media
router.post("/upload", protect, upload.single("file"), uploadMedia);

// Route to get all media for the logged-in user
router.get("/", protect, getMedia);

// Route to get media by ID
router.get("/:id", protect, getMediaById);

// Route to download media file by filename
router.get("/:filename/download", protect, downloadMediaFile);

// Route to delete media by ID
router.delete("/:id", protect, deleteMedia);

export default router;
