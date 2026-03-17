/*
  Warnings:

  - You are about to drop the column `referenceId` on the `InterviewStage` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `Job` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "InterviewStage_referenceId_key";

-- DropIndex
DROP INDEX "Job_referenceId_key";

-- AlterTable
ALTER TABLE "InterviewStage" DROP COLUMN "referenceId";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "referenceId";
