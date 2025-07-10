"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../Controller/user.controller");
const auth_middleware_1 = require("../Middleware/auth.middleware");
const router = (0, express_1.Router)();
// Register a new user
router.post("/register", user_controller_1.register);
// Login user
router.post("/login", user_controller_1.login);
// Logout user
router.get("/logout", user_controller_1.logout);
// Get user profile
router.get("/profile", auth_middleware_1.protect, user_controller_1.profile);
exports.default = router;
