import { Request, Response } from "express";
import { AuthenticatedRequest } from "../Types";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { promises } from "dns";

export const updateFace = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { faceId } = req.params;
    const { isConfirmed } = req.body; // true or false

    const face = await prisma.recognizedFace.update({
      where: { id: faceId },
      data: { isConfirmed, isPotentialMatch: false },
    });

    res.json({ message: "Face confirmation updated", face });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update face confirmation" });
  }
};
