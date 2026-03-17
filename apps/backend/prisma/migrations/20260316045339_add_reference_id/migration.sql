/*
  Warnings:

  - A unique constraint covering the columns `[referenceId]` on the table `InterviewStage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referenceId]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referenceId` to the `InterviewStage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referenceId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewStage" ADD COLUMN     "referenceId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "referenceId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InterviewStage_referenceId_key" ON "InterviewStage"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_referenceId_key" ON "Job"("referenceId");
