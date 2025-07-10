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
exports.moveManyToBin = exports.moveToBin = exports.deleteAllMedia = exports.deleteMedia = exports.deleteSelectedMedia = exports.downloadMultipleMedia = exports.downloadMediaFile = exports.getMediaById = exports.getMedia = exports.uploadMedia = void 0;
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const archiver_1 = __importDefault(require("archiver"));
const Prisma = new client_1.PrismaClient();
const uploadMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const files = req.files;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!files || files.length === 0 || !userId) {
            res.status(400).json({ message: "Missing files or user." });
            return;
        }
        const { albumId, takenAt } = req.body;
        // Ensure uploads directory exists
        const uploadDir = path_1.default.join(__dirname, "..", "uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const createdMedia = [];
        for (const file of files) {
            const ext = (_b = file.originalname.split(".").pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase();
            const mediaType = ext === "mp4" || ext === "mov" || ext === "avi" ? "VIDEO" : "PHOTO";
            const newMedia = yield Prisma.media.create({
                data: {
                    userId,
                    albumId: albumId || null,
                    url: `/uploads/${file.filename}`,
                    thumbnailUrl: null,
                    type: mediaType,
                    takenAt: takenAt ? new Date(takenAt) : undefined,
                },
            });
            createdMedia.push(newMedia);
        }
        // Batch trigger face recognition for all photos
        const photoItems = createdMedia
            .filter((media) => media.type === "PHOTO")
            .map((media) => ({
            media_id: media.id,
            filename: path_1.default.basename(media.url),
        }));
        if (photoItems.length > 0) {
            axios_1.default
                .post(`${process.env.FACE_API_KEY}`, { items: photoItems })
                .then(() => console.log(`Recognition batch triggered for ${photoItems.length} items`))
                .catch((err) => console.error("Batch recognition failed:", err));
        }
        res.status(201).json({ media: createdMedia });
    }
    catch (err) {
        console.error("Upload failed:", err);
        res.status(500).json({ message: "Upload failed" });
    }
});
exports.uploadMedia = uploadMedia;
const getMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated." });
            return;
        }
        const media = yield Prisma.media.findMany({
            where: { userId, deletedAt: null },
            orderBy: { takenAt: "desc" },
        });
        res.status(200).json({ media });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve media" });
    }
});
exports.getMedia = getMedia;
const getMediaById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated." });
            return;
        }
        const media = yield Prisma.media.findUnique({
            where: { id, userId },
        });
        if (!media) {
            res.status(404).json({ message: "Media not found" });
            return;
        }
        res.status(200).json({ media });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to retrieve media" });
    }
});
exports.getMediaById = getMediaById;
const downloadMediaFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { filename } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // Verify the media belongs to the authenticated user
        const media = yield Prisma.media.findFirst({
            where: {
                url: `/uploads/${filename}`,
                userId,
            },
        });
        if (!media) {
            res.status(404).json({ message: "Media not found" });
            return;
        }
        const filePath = path_1.default.join(__dirname, "..", "uploads", filename);
        if (!fs_1.default.existsSync(filePath)) {
            res.status(404).json({ message: "File not found on disk" });
            return;
        }
        // Send file as download
        res.download(filePath, filename);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to download media" });
    }
});
exports.downloadMediaFile = downloadMediaFile;
const downloadMultipleMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ids } = req.body; // Accept media IDs in POST body
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No media IDs provided" });
            return;
        }
        // Fetch media records and validate ownership
        const mediaItems = yield Prisma.media.findMany({
            where: {
                id: { in: ids },
                userId,
            },
        });
        if (mediaItems.length === 0) {
            res.status(404).json({ message: "No valid media found" });
            return;
        }
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename=media-download.zip`);
        const archive = (0, archiver_1.default)("zip", { zlib: { level: 9 } });
        archive.pipe(res);
        for (const media of mediaItems) {
            const filePath = path_1.default.join(__dirname, "..", "uploads", path_1.default.basename(media.url));
            if (fs_1.default.existsSync(filePath)) {
                archive.file(filePath, { name: path_1.default.basename(media.url) });
            }
        }
        yield archive.finalize();
    }
    catch (error) {
        console.error("Download error:", error);
        res.status(500).json({ message: "Failed to download media files" });
    }
});
exports.downloadMultipleMedia = downloadMultipleMedia;
const deleteSelectedMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { mediaIds } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
            res.status(400).json({ message: "No media IDs provided." });
            return;
        }
        // Step 1: Get all media to be deleted
        const mediaItems = yield Prisma.media.findMany({
            where: {
                id: { in: mediaIds },
                userId,
            },
        });
        // Step 2: Delete files from disk
        mediaItems.forEach((media) => {
            const filePath = path_1.default.join(__dirname, "..", "uploads", path_1.default.basename(media.url));
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file for media ${media.id}:`, err);
                }
            });
        });
        // Step 3: Delete from DB
        yield Prisma.media.deleteMany({
            where: {
                id: { in: mediaIds },
                userId,
            },
        });
        res.status(200).json({ message: "Selected media deleted successfully." });
    }
    catch (err) {
        console.error("Error deleting selected media:", err);
        res.status(500).json({ message: "Failed to delete selected media." });
    }
});
exports.deleteSelectedMedia = deleteSelectedMedia;
const deleteMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated." });
            return;
        }
        const media = yield Prisma.media.findUnique({
            where: { id },
        });
        if (!media) {
            res.status(404).json({ message: "Media not found" });
            return;
        }
        if (media.userId !== userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        // Delete physical file
        const filePath = path_1.default.join(__dirname, "..", "uploads", path_1.default.basename(media.url));
        fs_1.default.unlink(filePath, (err) => {
            if (err)
                console.error("Failed to delete file from disk:", err);
        });
        // Delete from DB
        yield Prisma.media.delete({ where: { id } });
        res.status(200).json({ message: "Media deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete media" });
    }
});
exports.deleteMedia = deleteMedia;
const deleteAllMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(400).json({ message: "User not authenticated." });
            return;
        }
        // Delete related recognized faces
        const mediaList = yield Prisma.media.findMany({
            where: { userId },
            select: { id: true },
        });
        const mediaIds = mediaList.map((m) => m.id);
        yield Prisma.recognizedFace.deleteMany({
            where: { mediaId: { in: mediaIds } },
        });
        // Delete media from DB
        yield Prisma.media.deleteMany({ where: { userId } });
        // Delete all files inside uploads folder but keep folder
        const uploadsDir = path_1.default.join(__dirname, "..", "uploads");
        if (fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.readdirSync(uploadsDir).forEach((file) => {
                try {
                    fs_1.default.unlinkSync(path_1.default.join(uploadsDir, file));
                }
                catch (e) {
                    console.warn(`File not found or could not delete: ${file}`);
                }
            });
        }
        res.status(200).json({ message: "All media deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete all media" });
    }
});
exports.deleteAllMedia = deleteAllMedia;
const moveToBin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        const media = yield Prisma.media.findUnique({ where: { id } });
        if (!media || media.userId !== userId) {
            res.status(404).json({ message: "Media not found or unauthorized" });
            return;
        }
        yield Prisma.media.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        res.status(200).json({ message: "Media moved to bin" });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to move media to bin" });
    }
});
exports.moveToBin = moveToBin;
const moveManyToBin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ids } = req.body; // Expect array of media IDs
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated." });
            return;
        }
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ message: "No media IDs provided." });
            return;
        }
        // Optional: Ensure only user's media are affected
        const media = yield Prisma.media.findMany({
            where: {
                id: { in: ids },
                userId,
            },
        });
        if (media.length === 0) {
            res.status(404).json({ message: "No media found or unauthorized." });
            return;
        }
        yield Prisma.media.updateMany({
            where: {
                id: { in: ids },
                userId,
            },
            data: { deletedAt: new Date() },
        });
        res.status(200).json({ message: "Selected media moved to bin." });
    }
    catch (err) {
        console.error("Error moving to bin:", err);
        res.status(500).json({ message: "Server error moving media to bin." });
    }
});
exports.moveManyToBin = moveManyToBin;
