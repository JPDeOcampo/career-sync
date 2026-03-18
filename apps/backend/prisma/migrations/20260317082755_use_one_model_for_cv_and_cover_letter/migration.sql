/*
  Warnings:

  - You are about to drop the column `cvVersionId` on the `Job` table. All the data in the column will be lost.
  - The `coverLetterId` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CVVersion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CoverLetter` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cvId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CV', 'COVER_LETTER');

-- DropForeignKey
ALTER TABLE "CVVersion" DROP CONSTRAINT "CVVersion_userId_fkey";

-- DropForeignKey
ALTER TABLE "CoverLetter" DROP CONSTRAINT "CoverLetter_userId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "cvVersionId",
ADD COLUMN     "cvId" UUID NOT NULL,
DROP COLUMN "coverLetterId",
ADD COLUMN     "coverLetterId" UUID;

-- DropTable
DROP TABLE "CVVersion";

-- DropTable
DROP TABLE "CoverLetter";

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_type_idx" ON "Document"("userId", "type");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_coverLetterId_fkey" FOREIGN KEY ("coverLetterId") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
