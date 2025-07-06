import express from "express";
import { protect } from "../Middleware/auth.middleware";
import {
  deleteManyPermanently,
  getBin,
  restoreMedia,
} from "../Controller/bin.controller";

const router = express.Router();

router.get("/all", protect, getBin);
router.delete("/delete-many", protect, deleteManyPermanently);
router.patch("/restore-many", protect, restoreMedia);

export default router;
