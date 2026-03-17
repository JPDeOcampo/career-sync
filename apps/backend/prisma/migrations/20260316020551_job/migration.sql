-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "jobDescription" TEXT,
    "jobType" TEXT,
    "salary" TEXT,
    "workSetup" TEXT,
    "workSchedule" TEXT,
    "location" TEXT,
    "jobLink" TEXT,
    "applicationMethod" TEXT,
    "applicationDate" TIMESTAMP(3),
    "status" TEXT,
    "priority" TEXT,
    "cvVersion" TEXT,
    "coverLetterSent" BOOLEAN NOT NULL DEFAULT false,
    "contact" TEXT,
    "offer" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewStage" (
    "id" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "interviewType" TEXT NOT NULL,
    "interviewDate" TIMESTAMP(3),
    "interviewTime" TEXT,
    "interviewerName" TEXT,
    "interviewComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewStage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Job_userId_idx" ON "Job"("userId");

-- CreateIndex
CREATE INDEX "InterviewStage_jobId_idx" ON "InterviewStage"("jobId");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewStage" ADD CONSTRAINT "InterviewStage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
