import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRecognitionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Support both single item and batch items
    const items = Array.isArray(req.body.items)
      ? req.body.items
      : req.body.mediaId
      ? [req.body] // single item format fallback
      : null;

    if (!items) {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }

    let totalMatches = 0;
    let totalNewPersons = 0;

    for (const item of items) {
      const { mediaId, matches = [], newPersons = [] } = item;

      if (!mediaId) continue;

      const media = await prisma.media.findUnique({ where: { id: mediaId } });
      if (!media) continue;

      // Save new persons
      for (const personId of newPersons) {
        const existing = await prisma.person.findUnique({
          where: { id: personId },
        });
        if (!existing) {
          await prisma.person.create({
            data: {
              id: personId,
              userId: media.userId,
              folderPath: `/persons/${personId}`,
              name: "Unknown",
            },
          });
          console.log(`✅ New person created: ${personId}`);
        }
      }

      // Save recognized faces
      for (const match of matches) {
        const { personId, boundingBox, encoding } = match;

        await prisma.recognizedFace.create({
          data: {
            mediaId: media.id,
            personId,
            boundingBox,
            encoding: encoding || null,
            similarity: match.similarity || 1,
            isPotentialMatch: match.isPotentialMatch ?? true,
          },
        });
      }

      // Update recognition status
      await prisma.media.update({
        where: { id: media.id },
        data: { recognitionStatus: "DONE" },
      });

      totalMatches += matches.length;
      totalNewPersons += newPersons.length;

      console.log(
        `✅ Saved recognition for media ${media.id}: ${matches.length} faces, ${newPersons.length} new persons`
      );
    }

    console.log(
      `✅ Recognition completed. Total matches: ${totalMatches}, new persons: ${totalNewPersons}`
    );

    res.status(200).json({
      message: "Recognition results saved successfully",
      savedMatches: totalMatches,
      newPersons: totalNewPersons,
    });
  } catch (error) {
    console.error("❌ Error processing recognition status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
