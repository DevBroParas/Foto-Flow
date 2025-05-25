import { Request, Response } from "express";
import { PrismaClient, MediaType } from "@prisma/client";
import { AuthenticatedRequest } from "../Types";

const prisma = new PrismaClient();

export const getAllPersons = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  const persons = await prisma.person.findMany({
    where: { userId },
    include: {
      faces: {
        include: {
          media: true,
        },
      },
    },
  });

  res.json(persons);
};

export const getPersonById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      faces: {
        include: {
          media: true,
        },
      },
    },
  });

  if (!person || person.userId !== userId) {
    res.status(404).json({ message: "Person not found" });
    return;
  }

  res.json(person);
};

export const updatePerson = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name } = req.body;
  const userId = req.user?.id;

  const person = await prisma.person.findUnique({ where: { id } });
  if (!person || person.userId !== userId) {
    res.status(404).json({ message: "Person not found" });
    return;
  }

  const updated = await prisma.person.update({
    where: { id },
    data: { name },
  });

  res.json(updated);
};

export const deletePerson = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  const person = await prisma.person.findUnique({ where: { id } });
  if (!person || person.userId !== userId) {
    res.status(404).json({ message: "Person not found" });
    return;
  }

  await prisma.recognizedFace.deleteMany({ where: { personId: id } });

  await prisma.person.delete({ where: { id } });

  res.json({ message: "Person deleted" });
};

// delete all persons for a user
export const deleteAllPersons = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(400).json({ message: "User not authenticated." });
    return;
  }

  await prisma.recognizedFace.deleteMany({ where: { person: { userId } } });
  await prisma.person.deleteMany({ where: { userId } });

  res.json({ message: "All persons deleted" });
};
