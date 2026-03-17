/*
  Warnings:

  - You are about to drop the column `cvVersion` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "cvVersion";

-- CreateTable
CREATE TABLE "CVVersion" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CVVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CVVersion" ADD CONSTRAINT "CVVersion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
