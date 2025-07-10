import express from "express";
import {
  uploadMedia,
  getMedia,
  deleteMedia,
  getMediaById,
  downloadMediaFile,
  downloadMultipleMedia,
  deleteAllMedia,
  moveToBin,
  moveManyToBin,
} from "../Controller/media.controller";
import { protect } from "../Middleware/auth.middleware";
import { upload } from "../Middleware/upload.middleware";

const router = express.Router();

router.post("/upload", protect, upload.array("files", 50), uploadMedia);
router.get("/", protect, getMedia);

router.delete("/delete-all", protect, deleteAllMedia);
router.post("/download-multiple", protect, downloadMultipleMedia);

router.patch("/move-to-bin", protect, moveManyToBin);
router.delete("/delete-selected", protect, deleteMedia);

router.get("/:filename/download", protect, downloadMediaFile);
router.get("/:id", protect, getMediaById);
router.delete("/:id", protect, deleteMedia);
router.patch("/:id/bin", protect, moveToBin);

export default router;
