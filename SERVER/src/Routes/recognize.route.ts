import express from "express";
import { triggerRecognition } from "../Controller/recognize.controller";
import { protect } from "../Middleware/auth.middleware";

const router = express.Router();
router.post("/:mediaId", protect, triggerRecognition);
export default router;
