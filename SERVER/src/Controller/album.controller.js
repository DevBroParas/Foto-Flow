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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAlbum = exports.updateAlbum = exports.getAlbumById = exports.getUserAlbums = exports.createAlbum = void 0;
const client_1 = require("@prisma/client");
const Prisma = new client_1.PrismaClient();
// Create a new album
const createAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const { title, description, coverPhotoId, mediaIds } = req.body;
        if (!title) {
            res.status(400).json({ message: "Title is required" });
            return;
        }
        const album = yield Prisma.album.create({
            data: {
                title,
                description,
                userId: user.id,
                coverPhotoId,
                media: mediaIds && Array.isArray(mediaIds)
                    ? {
                        connect: mediaIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                coverPhoto: true,
                media: true,
            },
        });
        res.status(201).json({ album });
    }
    catch (error) {
        console.error("Error creating album:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.createAlbum = createAlbum;
// Get all albums for the logged-in user
const getUserAlbums = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const albums = yield Prisma.album.findMany({
            where: { userId: user.id },
            include: {
                coverPhoto: true,
                media: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ albums });
    }
    catch (error) {
        console.error("Error fetching albums:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserAlbums = getUserAlbums;
// Get single album by ID (must belong to the user)
const getAlbumById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const album = yield Prisma.album.findFirst({
            where: {
                id,
                userId: user.id,
            },
            include: {
                coverPhoto: true,
                media: true,
            },
        });
        if (!album) {
            res.status(404).json({ message: "Album not found" });
            return;
        }
        res.status(200).json({ album });
    }
    catch (error) {
        console.error("Error getting album:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAlbumById = getAlbumById;
// Update album
const updateAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { id } = req.params;
        const { title, description, coverPhotoId } = req.body;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        if (!title) {
            res.status(400).json({ message: "Title is required" });
            return;
        }
        const album = yield Prisma.album.findFirst({
            where: { id, userId: user.id },
        });
        if (!album) {
            res.status(404).json({ message: "Album not found" });
            return;
        }
        const updated = yield Prisma.album.update({
            where: { id },
            data: {
                title,
                description,
                coverPhotoId,
            },
        });
        res.status(200).json({ album: updated });
    }
    catch (error) {
        console.error("Error updating album:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateAlbum = updateAlbum;
// Delete album
const deleteAlbum = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { id } = req.params;
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const album = yield Prisma.album.findFirst({
            where: { id, userId: user.id },
        });
        if (!album) {
            res.status(404).json({ message: "Album not found" });
            return;
        }
        yield Prisma.album.delete({
            where: { id },
        });
        res.status(200).json({ message: "Album deleted" });
    }
    catch (error) {
        console.error("Error deleting album:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteAlbum = deleteAlbum;
