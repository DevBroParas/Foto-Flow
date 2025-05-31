import express from "express";
import { getRecognitionStatus } from "../Controller/recognize.controller";

const router = express.Router();
router.post("/internal", getRecognitionStatus);
export default router;
