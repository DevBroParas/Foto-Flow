-- AlterTable
ALTER TABLE "RecognizedFace" ADD COLUMN     "confirmed" BOOLEAN,
ADD COLUMN     "isPotential" BOOLEAN NOT NULL DEFAULT false;
