import express, { Router } from "express";
import {
  login,
  logout,
  profile,
  register,
} from "../Controller/user.controller";
import { protect } from "../Middleware/auth.middleware";

const router = Router();

// Register a new user
router.post("/register", register);

// Login user
router.post("/login", login);

// Logout user
router.get("/logout", logout);

// Get user profile
router.get("/profile", protect, profile);

export default router;
