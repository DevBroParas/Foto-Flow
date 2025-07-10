"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const album_controller_1 = require("../Controller/album.controller");
const auth_middleware_1 = require("../Middleware/auth.middleware");
const router = express_1.default.Router();
// Create a new album
router.post('/', auth_middleware_1.protect, album_controller_1.createAlbum);
// Get all albums for the logged-in user
router.get('/', auth_middleware_1.protect, album_controller_1.getUserAlbums);
// Get album by ID
router.get('/:id', auth_middleware_1.protect, album_controller_1.getAlbumById);
// Update album by ID
router.put('/:id', auth_middleware_1.protect, album_controller_1.updateAlbum);
// Delete album by ID
router.delete('/:id', auth_middleware_1.protect, album_controller_1.deleteAlbum);
exports.default = router;
