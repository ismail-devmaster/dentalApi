/*
  Warnings:

  - A unique constraint covering the columns `[gender]` on the table `Sex` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Sex_gender_key" ON "Sex"("gender");
