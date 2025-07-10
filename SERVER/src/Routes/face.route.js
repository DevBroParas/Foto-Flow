"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const face_controller_1 = require("../Controller/face.controller");
const auth_middleware_1 = require("../Middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/faces/:faceId/confirm", auth_middleware_1.protect, face_controller_1.updateFace);
exports.default = router;
