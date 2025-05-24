import { Request, Response } from "express";
import { PrismaClient, MediaType } from "@prisma/client";
import { AuthenticatedRequest } from "../Types";
import path from "path";
import fs from "fs";

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
      where: { userId },
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
