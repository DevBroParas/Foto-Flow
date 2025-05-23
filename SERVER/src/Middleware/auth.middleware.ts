import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const Prisma = new PrismaClient();

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const protect = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
       res.status(401).json({ message: "No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    const user = await Prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
         res.status(401).json({ message: "User not found" });
    }

    (req as any).user = user;

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
