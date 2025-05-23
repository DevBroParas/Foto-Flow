import express, { Router } from "express";
import { login, logout, profile, register } from "../Controller/user.controller";
import { protect } from "../Middleware/auth.middleware";



const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/profile",protect ,profile);

export default router;