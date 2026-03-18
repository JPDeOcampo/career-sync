/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Document_userId_name_key" ON "Document"("userId", "name");
