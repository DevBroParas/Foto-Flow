/*
  Warnings:

  - You are about to drop the column `confirmed` on the `RecognizedFace` table. All the data in the column will be lost.
  - You are about to drop the column `isPotential` on the `RecognizedFace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RecognizedFace" DROP COLUMN "confirmed",
DROP COLUMN "isPotential",
ADD COLUMN     "isConfirmed" BOOLEAN,
ADD COLUMN     "isPotentialMatch" BOOLEAN NOT NULL DEFAULT false;
