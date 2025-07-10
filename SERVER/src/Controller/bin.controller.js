"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManyPermanently = exports.restoreMedia = exports.getBin = void 0;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Prisma = new client_1.PrismaClient();
const getBin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated." });
            return;
        }
        const media = yield Prisma.media.findMany({
            where: { userId, deletedAt: { not: null } },
            orderBy: { takenAt: "desc" },
        });
        res.status(200).json({ media });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve media" });
    }
});
exports.getBin = getBin;
//restore many media
const restoreMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ids } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No media IDs provided." });
            return;
        }
        yield Prisma.media.updateMany({
            where: {
                id: { in: ids },
                userId,
                deletedAt: { not: null },
            },
            data: { deletedAt: null },
        });
        res.status(200).json({ message: "Media restored successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to restore media" });
    }
});
exports.restoreMedia = restoreMedia;
//delete all ids media
const deleteManyPermanently = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ids } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No media IDs provided." });
            return;
        }
        // Step 1: Get all matching media items for the user
        const mediaItems = yield Prisma.media.findMany({
            where: {
                id: { in: ids },
                userId,
            },
        });
        // Step 2: Delete related RecognizedFace entries first
        yield Prisma.recognizedFace.deleteMany({
            where: {
                mediaId: {
                    in: ids,
                },
            },
        });
        // Step 3: Delete physical media files
        mediaItems.forEach((media) => {
            try {
                const filePath = path_1.default.join(__dirname, "..", "uploads", media.url);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            catch (err) {
                console.warn(`Failed to delete file for media ID ${media.id}:`, err);
            }
        });
        // Step 4: Delete the media entries
        yield Prisma.media.deleteMany({
            where: {
                id: { in: ids },
                userId,
            },
        });
        res.status(200).json({ message: "Media deleted permanently." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete media." });
    }
});
exports.deleteManyPermanently = deleteManyPermanently;
