import { Router } from "express";
import { updateFace } from "../Controller/face.controller";
import { protect } from "../Middleware/auth.middleware";

const router = Router();

router.post("/faces/:faceId/confirm", protect, updateFace);

export default router;
