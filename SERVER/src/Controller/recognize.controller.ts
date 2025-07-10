import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const getRecognitionStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Support both array and single object
    const items: {
      mediaId: string;
      matches: {
        personId: string;
        boundingBox: {
          top: number;
          right: number;
          bottom: number;
          left: number;
        };
        encoding?: Prisma.InputJsonValue;
        similarity?: number;
        isPotentialMatch?: boolean;
      }[];
      newPersons: string[];
    }[] = Array.isArray(req.body.items)
      ? req.body.items
      : req.body.mediaId
      ? [req.body]
      : [];

    if (items.length === 0) {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }

    let totalMatches = 0;
    let totalNewPersons = 0;

    for (const item of items) {
      const { mediaId, matches = [], newPersons = [] } = item;

      if (!mediaId) continue;

      const media = await prisma.media.findUnique({ where: { id: mediaId } });
      if (!media) {
        console.warn(`⚠️ Media not found for id: ${mediaId}`);
        continue;
      }

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
              name: "Unknown",
              folderPath: `/persons/${personId}`,
            },
          });
          totalNewPersons++;
          console.log(`✅ New person created: ${personId}`);
        }
      }

      // Save recognized faces
      for (const match of matches) {
        const {
          personId,
          boundingBox,
          encoding,
          similarity,
          isPotentialMatch,
        } = match;

        if (!personId || !boundingBox) {
          console.warn(`⚠️ Skipped face with missing personId or boundingBox`);
          continue;
        }

        await prisma.recognizedFace.create({
          data: {
            mediaId,
            personId,
            boundingBox,
            encoding: encoding ? JSON.stringify(encoding) : null,
            similarity: similarity ?? 1,
            isPotentialMatch: isPotentialMatch ?? true,
          },
        });

        totalMatches++;
      }

      // Update recognition status
      await prisma.media.update({
        where: { id: mediaId },
        data: {
          recognitionStatus: "DONE",
          width: (item as any).width ?? undefined,
          height: (item as any).height ?? undefined,
        },
      });

      console.log(
        `✅ Processed media ${mediaId}: ${matches.length} faces, ${newPersons.length} new persons`
      );
    }

    console.log(
      `🎉 Recognition complete. Total matches: ${totalMatches}, new persons: ${totalNewPersons}`
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
