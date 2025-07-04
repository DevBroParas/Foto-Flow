import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../Types";
const Prisma = new PrismaClient();

// Create a new album
export const createAlbum = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const album = await Prisma.album.create({
      data: {
        title,
        description,
        userId: user.id,
        coverPhotoId,
        media:
          mediaIds && Array.isArray(mediaIds)
            ? {
                connect: mediaIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      include: {
        coverPhoto: true,
        media: true,
      },
    });

    res.status(201).json({ album });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all albums for the logged-in user
export const getUserAlbums = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const albums = await Prisma.album.findMany({
      where: { userId: user.id },
      include: {
        coverPhoto: true,
        media: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ albums });
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get single album by ID (must belong to the user)
export const getAlbumById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const album = await Prisma.album.findFirst({
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
  } catch (error) {
    console.error("Error getting album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update album
export const updateAlbum = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
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

    const album = await Prisma.album.findFirst({
      where: { id, userId: user.id },
    });

    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }

    const updated = await Prisma.album.update({
      where: { id },
      data: {
        title,
        description,
        coverPhotoId,
      },
    });

    res.status(200).json({ album: updated });
  } catch (error) {
    console.error("Error updating album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete album
export const deleteAlbum = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const album = await Prisma.album.findFirst({
      where: { id, userId: user.id },
    });

    if (!album) {
      res.status(404).json({ message: "Album not found" });
      return;
    }

    await Prisma.album.delete({
      where: { id },
    });

    res.status(200).json({ message: "Album deleted" });
  } catch (error) {
    console.error("Error deleting album:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
