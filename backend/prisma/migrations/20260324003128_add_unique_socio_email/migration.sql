/*
  Warnings:

  - A unique constraint covering the columns `[contactEmail]` on the table `SocioFormador` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SocioFormador_contactEmail_key" ON "SocioFormador"("contactEmail");
