import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../Types";
import path from "path";
import fs from "fs";

const Prisma = new PrismaClient();

export const getBin = async (
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
      where: { userId, deletedAt: { not: null } },
      orderBy: { takenAt: "desc" },
    });

    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve media" });
  }
};

//restore many media
export const restoreMedia = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "No media IDs provided." });
      return;
    }

    await Prisma.media.updateMany({
      where: {
        id: { in: ids },
        userId,
        deletedAt: { not: null },
      },
      data: { deletedAt: null },
    });

    res.status(200).json({ message: "Media restored successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to restore media" });
  }
};

//delete all ids media
export const deleteManyPermanently = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { ids } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: "No media IDs provided." });
      return;
    }

    const mediaItems = await Prisma.media.findMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    mediaItems.forEach((media) => {
      try {
        const filePath = path.join(__dirname, "..", "uploads", media.url); // or media.fileName
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`Failed to delete file for media ID ${media.id}:`, err);
      }
    });

    await Prisma.media.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });

    res.status(200).json({ message: "Media deleted permanently." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete media." });
  }
};
