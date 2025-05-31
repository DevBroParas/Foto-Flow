import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export const getRecognitionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { mediaId, matches, newPersons } = req.body;

    if (!mediaId || !Array.isArray(matches) || !Array.isArray(newPersons)) {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      res.status(404).json({ message: "Media not found" });
      return;
    }

    // 1. Save new persons
    for (const personId of newPersons) {
      // Avoid duplicates if same personId already exists
      const existing = await prisma.person.findUnique({ where: { id: personId } });
      if (!existing) {
        await prisma.person.create({
          data: {
            id: personId,
            userId: media.userId,
            folderPath: `/persons/${personId}`,
            name: "Unknown",
          },
        });
      }
    }

    // 2. Save recognized faces
    for (const match of matches) {
      const { personId, boundingBox, encoding} = match;

      await prisma.recognizedFace.create({
        data: {
          mediaId: media.id,
          personId,
          boundingBox,
          encoding: encoding || null,
          similarity: match.similarity || 1, // Default to 1 if not provided
          isPotentialMatch: true,
        },
      });
    }

    // 3. Update media recognition status
    await prisma.media.update({
      where: { id: media.id },
      data: { recognitionStatus: "DONE" },
    });

    console.log("Recognition results saved successfully:", {
      mediaId: media.id,
      matches: matches.length,
      newPersons: newPersons.length,
    });

    res.status(200).json({
      message: "Recognition results saved successfully",
      savedMatches: matches.length,
      newPersons: newPersons.length,
    });


  } catch (error) {
    console.error("Error processing recognition status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
