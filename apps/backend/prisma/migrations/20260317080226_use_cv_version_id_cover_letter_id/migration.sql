/*
  Warnings:

  - You are about to drop the column `jobId` on the `CVVersion` table. All the data in the column will be lost.
  - You are about to drop the column `coverLetterSent` on the `Job` table. All the data in the column will be lost.
  - Added the required column `userId` to the `CVVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InterviewStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverLetterId` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cvVersionId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CVVersion" DROP CONSTRAINT "CVVersion_jobId_fkey";

-- AlterTable
ALTER TABLE "CVVersion" DROP COLUMN "jobId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "InterviewStage" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "coverLetterSent",
ADD COLUMN     "coverLetterId" TEXT NOT NULL,
ADD COLUMN     "cvVersionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoverLetter_userId_idx" ON "CoverLetter"("userId");

-- CreateIndex
CREATE INDEX "CVVersion_userId_idx" ON "CVVersion"("userId");

-- AddForeignKey
ALTER TABLE "CVVersion" ADD CONSTRAINT "CVVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoverLetter" ADD CONSTRAINT "CoverLetter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
