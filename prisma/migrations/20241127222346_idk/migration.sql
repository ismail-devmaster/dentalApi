/*
  Warnings:

  - You are about to drop the column `medicalHistories` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "medicalHistories",
ADD COLUMN     "medicalHistory" TEXT;
