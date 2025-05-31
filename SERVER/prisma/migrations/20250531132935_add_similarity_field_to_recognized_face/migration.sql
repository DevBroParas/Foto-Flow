/*
  Warnings:

  - Added the required column `similarity` to the `RecognizedFace` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RecognizedFace" ADD COLUMN     "similarity" DOUBLE PRECISION NOT NULL;
