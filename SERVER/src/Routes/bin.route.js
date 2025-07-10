"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../Middleware/auth.middleware");
const bin_controller_1 = require("../Controller/bin.controller");
const router = express_1.default.Router();
router.get("/all", auth_middleware_1.protect, bin_controller_1.getBin);
router.delete("/delete-many", auth_middleware_1.protect, bin_controller_1.deleteManyPermanently);
router.patch("/restore-many", auth_middleware_1.protect, bin_controller_1.restoreMedia);
exports.default = router;
