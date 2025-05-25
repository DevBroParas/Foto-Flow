import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const triggerRecognition = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { mediaId } = req.params;
  // Lookup media
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    res.status(404).json({ message: "Media not found" });
    return;
  }

  if (!process.env.FACE_API_KEY) {
    throw new Error("FACE_API_KEY environment variable is not set");
  }

  try {
    const resp = await axios.post(process.env.FACE_API_KEY, {
      media_id: media.id,
      filename: media.url.split("/").pop(),
    });
    const { matches, newPersons } = resp.data;

    // Create Person entries for newPersons
    for (const pid of newPersons) {
      await prisma.person.create({
        data: { id: pid, userId: media.userId, folderPath: pid },
      });
    }

    // Create RecognizedFace records and update media status
    for (const match of matches) {
      await prisma.recognizedFace.create({
        data: {
          mediaId: media.id,
          personId: match.personId,
          encoding: undefined,
          boundingBox: match.boundingBox,
        },
      });
    }

    await prisma.media.update({
      where: { id: media.id },
      data: { recognitionStatus: "DONE" },
    });

    res.json({ message: "Recognition complete", matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Recognition service error" });
  }
};

export const triggerRecognitionInternal = async (
  mediaId: string
): Promise<void> => {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) throw new Error("Media not found");

  if (!process.env.FACE_API_KEY) {
    throw new Error("FACE_API_KEY environment variable is not set");
  }

  const resp = await axios.post(process.env.FACE_API_KEY, {
    media_id: media.id,
    filename: media.url.split("/").pop(),
  });

  const { matches, newPersons } = resp.data;

  for (const pid of newPersons) {
    await prisma.person.create({
      data: { id: pid, userId: media.userId, folderPath: pid },
    });
  }

for (const match of matches) {
  await prisma.recognizedFace.create({
    data: {
      mediaId: media.id,
      personId: match.personId,
      encoding: undefined,
      boundingBox: match.boundingBox,
      isPotentialMatch: match.isPotentialMatch,
      isConfirmed: match.isPotentialMatch ? null : true, // If not potential, auto-confirm
    },
  });
}


  await prisma.media.update({
    where: { id: media.id },
    data: { recognitionStatus: "DONE" },
  });
};

