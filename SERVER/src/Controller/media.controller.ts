import { Request, Response } from "express";
import { PrismaClient, MediaType } from "@prisma/client";
import { AuthenticatedRequest } from "../Types";
import path from "path";
import fs from "fs";
import axios from "axios";

const Prisma = new PrismaClient();

export const uploadMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const file = req.file;
    const userId = req.user?.id;

    if (!file || !userId) {
      res.status(400).json({ message: "Missing file or user." });
      return;
    }

    // ✅ Ensure uploads directory exists
    const uploadDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const { albumId, takenAt } = req.body;

    const ext = file.originalname.split(".").pop()?.toLowerCase();
    const mediaType: MediaType =
      ext === "mp4" || ext === "mov" || ext === "avi" ? "VIDEO" : "PHOTO";

    const newMedia = await Prisma.media.create({
      data: {
        userId,
        albumId: albumId || null,
        url: `/uploads/${file.filename}`,
        thumbnailUrl: null,
        type: mediaType,
        takenAt: takenAt ? new Date(takenAt) : undefined,
      },
    });
    // Send request to Face Recognisation API
    if (mediaType === "PHOTO") {
      await axios
        .post(process.env.FACE_API_KEY!, {
          media_id: newMedia.id,
          filename: file.filename,
        })

        .then(() =>
          console.log(`Recognition triggered for media ${newMedia.id}`)
        )
        .catch((err) => console.error("Recognition failed:", err));
    }

    res.status(201).json({ media: newMedia });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User not authenticated." });
      return;
    }

    const media = await Prisma.media.findMany({
      where: { userId, deletedAt: null },
      orderBy: { takenAt: "desc" },
    });

    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve media" });
  }
};

export const getMediaById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(400).json({ message: "User not authenticated." });
      return;
    }

    const media = await Prisma.media.findUnique({
      where: { id, userId },
    });

    if (!media) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve media" });
  }
};

export const downloadMediaFile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { filename } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Verify the media belongs to the authenticated user
    const media = await Prisma.media.findFirst({
      where: {
        url: `/uploads/${filename}`,
        userId,
      },
    });

    if (!media) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: "File not found on disk" });
      return;
    }

    // Send file as download
    res.download(filePath, filename);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to download media" });
  }
};

export const deleteSelectedMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { mediaIds } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      res.status(400).json({ message: "No media IDs provided." });
      return;
    }

    // Step 1: Get all media to be deleted
    const mediaItems = await Prisma.media.findMany({
      where: {
        id: { in: mediaIds },
        userId,
      },
    });

    // Step 2: Delete files from disk
    mediaItems.forEach((media) => {
      const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        path.basename(media.url)
      );

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file for media ${media.id}:`, err);
        }
      });
    });

    // Step 3: Delete from DB
    await Prisma.media.deleteMany({
      where: {
        id: { in: mediaIds },
        userId,
      },
    });

    res.status(200).json({ message: "Selected media deleted successfully." });
  } catch (err) {
    console.error("Error deleting selected media:", err);
    res.status(500).json({ message: "Failed to delete selected media." });
  }
};

export const deleteMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as AuthenticatedRequest).user?.id;

    if (!userId) {
      res.status(400).json({ message: "User not authenticated." });
      return;
    }

    const media = await Prisma.media.findUnique({
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
    const filePath = path.join(
      __dirname,
      "..",
      "uploads",
      path.basename(media.url)
    );
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete file from disk:", err);
    });

    // Delete from DB
    await Prisma.media.delete({ where: { id } });

    res.status(200).json({ message: "Media deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete media" });
  }
};

export const deleteAllMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "User not authenticated." });
      return;
    }

    // Delete related recognized faces
    const mediaList = await Prisma.media.findMany({
      where: { userId },
      select: { id: true },
    });
    const mediaIds = mediaList.map((m) => m.id);
    await Prisma.recognizedFace.deleteMany({
      where: { mediaId: { in: mediaIds } },
    });

    // Delete media from DB
    await Prisma.media.deleteMany({ where: { userId } });

    // Delete all files inside uploads folder but keep folder
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (fs.existsSync(uploadsDir)) {
      fs.readdirSync(uploadsDir).forEach((file) => {
        try {
          fs.unlinkSync(path.join(uploadsDir, file));
        } catch (e) {
          console.warn(`File not found or could not delete: ${file}`);
        }
      });
    }

    res.status(200).json({ message: "All media deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete all media" });
  }
};

export const moveToBin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    const media = await Prisma.media.findUnique({ where: { id } });
    if (!media || media.userId !== userId) {
      res.status(404).json({ message: "Media not found or unauthorized" });
      return;
    }

    await Prisma.media.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Media moved to bin" });
  } catch (err) {
    res.status(500).json({ message: "Failed to move media to bin" });
  }
};

export const moveManyToBin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body; // Expect array of media IDs
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "No media IDs provided." });
      return;
    }

    // Optional: Ensure only user's media are affected
    const media = await Prisma.media.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    if (media.length === 0) {
      res.status(404).json({ message: "No media found or unauthorized." });
      return;
    }

    await Prisma.media.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Selected media moved to bin." });
  } catch (err) {
    console.error("Error moving to bin:", err);
    res.status(500).json({ message: "Server error moving media to bin." });
  }
};
