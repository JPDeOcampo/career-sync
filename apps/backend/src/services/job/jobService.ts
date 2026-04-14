import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma.js";
import { JobApplication } from "@career-sync/shared";
import { getRecentDate } from "@career-sync/shared";

// --- Add Job Logic ---
export const addJob = async (
  data: JobApplication,
  userID: string | string[],
) => {
  // Destructure data with defaults where appropriate
  const {
    id,
    company,
    roleTitle,
    jobDescription,
    jobType,
    salary,
    workSetup,
    workSchedule,
    location,
    jobLink,
    applicationMethod,
    applicationDate,
    status,
    priority,
    cvId,
    coverLetterId,
    interviewStages = [],
    contact,
    offer,
    notes,
  } = data;

  // Convert dates in interviewStages
  const interviewData = interviewStages.map((stage) => ({
    id: stage.id,
    interviewType: stage.interviewType,
    interviewDate: stage.interviewDate
      ? new Date(stage.interviewDate)
      : undefined,
    interviewerName: stage.interviewerName,
    interviewComment: stage.interviewComment,
  }));

  // Validate job ID uniqueness
  const [existingJob, existingUser] = await Promise.all([
    prisma.job.findUnique({ where: { id: id as string } }),
    prisma.user.findUnique({ where: { id: userID as string } }),
  ]);

  if (existingJob) {
    throw new AppError("Job ID already exists.", 400);
  }

  if (!existingUser) {
    throw new AppError("User not found.", 404);
  }

  const [cv, coverLetter] = await Promise.all([
    cvId ? prisma.document.findUnique({ where: { id: cvId } }) : null,
    coverLetterId
      ? prisma.document.findUnique({ where: { id: coverLetterId } })
      : null,
  ]);

  // Throw error if CV or cover letter is not found
  if (cvId && !cv) {
    throw new Error("CV document not found");
  }

  if (coverLetterId && !coverLetter) {
    throw new Error("Cover letter document not found");
  }

  // Create job in one go
  const job = await prisma.job.create({
    data: {
      id,
      company,
      roleTitle,
      jobDescription,
      jobType,
      salary,
      workSetup,
      workSchedule,
      location,
      jobLink,
      applicationMethod,
      applicationDate: applicationDate ? new Date(applicationDate) : undefined,
      status,
      priority,
      contact,
      interviewStages:
        interviewData.length > 0 ? { create: interviewData } : undefined,
      offer,
      notes,
      user: { connect: { id: userID as string } },
      ...(cvId && {
        cv: {
          connect: { id: cvId },
        },
      }),

      ...(coverLetterId && {
        coverLetter: {
          connect: { id: coverLetterId },
        },
      }),
    },
    include: {
      interviewStages: true,
      cv: true,
      coverLetter: true,
    },
  });

  return job;
};

export const getJobs = async (
  userID: string,
  filters: {
    sort?: string;
    status?: string;
    search?: string;
    priority?: string;
    page?: number;
    limit?: number;
  },
) => {
  const { sort, status, search, priority, page = 1, limit = 10 } = filters;

  const skip = (page - 1) * limit;
  const recentApplicationDate = getRecentDate(7);

  const isValid = (val?: string) =>
    val && val !== "All" && val !== "N/A" && val.trim() !== "";

  const getFilename = (path?: string | null) =>
    path ? path.split("/").pop() : null;

  const where = {
    userId: userID,
    ...(isValid(status) && { status }),
    ...(isValid(priority) && { priority }),

    ...(isValid(search) && {
      OR: [
        { roleTitle: { contains: search, mode: "insensitive" as const } },
        { company: { contains: search, mode: "insensitive" as const } },
        { location: { contains: search, mode: "insensitive" as const } },
      ],
    }),

    ...(sort === "recent" && {
      applicationDate: { gte: recentApplicationDate },
    }),
  };

  const orderBy =
    sort === "oldest"
      ? [{ createdAt: "asc" as const }]
      : [{ createdAt: "desc" as const }];

  const [data, totalJobs, statsByStatus, highPriorityCount] = await Promise.all(
    [
      prisma.job.findMany({
        where,
        include: {
          interviewStages: true,
          cv: true,
          coverLetter: true,
        },
        orderBy,
        skip,
        take: limit,
      }),

      prisma.job.count({ where }),

      prisma.job.groupBy({
        by: ["status"],
        where: { userId: userID },
        _count: { status: true },
      }),

      prisma.job.count({
        where: {
          userId: userID,
          priority: "High",
        },
      }),
    ],
  );

  const jobs = data.map((doc) => {
    const cvFilename = getFilename(doc.cv?.filePath);
    const coverLetterFilename = getFilename(doc.coverLetter?.filePath);

    return {
      ...doc,
      cv: doc.cv
        ? {
            ...doc.cv,
            fileUrl: cvFilename
              ? `${process.env.BACKEND_URL}/api/v1/document/${doc.userId}/${cvFilename}`
              : null,
          }
        : null,

      coverLetter: doc.coverLetter
        ? {
            ...doc.coverLetter,
            fileUrl: coverLetterFilename
              ? `${process.env.BACKEND_URL}/api/v1/document/${doc.userId}/${coverLetterFilename}`
              : null,
          }
        : null,
    };
  });

  const stats = {
    total: 0,
    applied: 0,
    underReview: 0,
    interviews: 0,
    offers: 0,
    rejected: 0,
    withdrawn: 0,
    highPriority: highPriorityCount,
  };

  statsByStatus.forEach(({ status, _count }) => {
    const count = _count.status;
    stats.total += count;

    if (status === "Applied") stats.applied = count;
    if (status === "Under Review") stats.underReview = count;
    if (status === "Interview") stats.interviews = count;
    if (status === "Offer") stats.offers = count;
    if (status === "Rejected") stats.rejected = count;
    if (status === "Withdrawn") stats.withdrawn = count;
  });

  return {
    jobs,
    stats,
    pagination: {
      total: totalJobs,
      page,
      limit,
      totalPages: Math.ceil(totalJobs / limit),
    },
  };
};

export const getJobById = async (id: string | string[], userID: string) => {
  const job = await prisma.job.findFirst({
    where: {
      id: id as unknown as string,
      userId: userID,
    },
    include: {
      interviewStages: true,
      user: {
        select: {
          id: true,
          firstName: true,
          email: true,
        },
      },
    },
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }

  return job;
};

export const updateJob = async (
  id: string | string[],
  userId: string,
  data: JobApplication,
) => {
  const jobId = Array.isArray(id) ? id[0] : id;

  const { id: _, userId: __, interviewStages = [], ...jobFields } = data;

  const existingJob = await prisma.job.findFirst({
    where: { id: jobId, userId },
    include: { interviewStages: true },
  });

  if (!existingJob) throw new AppError("Job not found", 404);

  // IDs of stages in request
  const incomingIds = interviewStages
    .filter((stage) => stage.id && stage.id.trim() !== "")
    .map((stage) => stage.id);

  // IDs of existing stages in DB
  const existingIds = existingJob.interviewStages.map((s) => s.id);

  // Delete stages that exist in DB but are missing from request
  const stagesToDelete = existingIds.filter((id) => !incomingIds.includes(id));

  const stagesToUpsert = interviewStages
    .filter((stage) => stage.id && stage.id.trim() !== "")
    .map((stage) => ({
      where: { id: stage.id },
      update: {
        interviewType: stage.interviewType,
        interviewDate: stage.interviewDate
          ? new Date(stage.interviewDate)
          : undefined,
        interviewTime: stage.interviewTime,
        interviewerName: stage.interviewerName,
        interviewComment: stage.interviewComment,
      },
      create: {
        interviewType: stage.interviewType,
        interviewDate: stage.interviewDate
          ? new Date(stage.interviewDate)
          : undefined,
        interviewTime: stage.interviewTime,
        interviewerName: stage.interviewerName,
        interviewComment: stage.interviewComment,
      },
    }));

  const stagesToCreate = interviewStages
    .filter((stage) => !stage.id || stage.id.trim() === "")
    .map((stage) => ({
      interviewType: stage.interviewType,
      interviewDate: stage.interviewDate
        ? new Date(stage.interviewDate)
        : undefined,
      interviewTime: stage.interviewTime,
      interviewerName: stage.interviewerName,
      interviewComment: stage.interviewComment,
    }));

  // Update Job
  return prisma.job.update({
    where: { id: jobId },
    data: {
      ...(() => {
        const { cv, coverLetter, ...safeJobFields } = jobFields;
        return safeJobFields;
      })(),
      applicationDate: data.applicationDate
        ? new Date(data.applicationDate)
        : undefined,
      cvId: data.cvId || null,
      coverLetterId: data.coverLetterId || null,
      interviewStages: {
        delete: stagesToDelete.map((id) => ({ id })),
        upsert: stagesToUpsert,
        create: stagesToCreate,
      },
    },
    include: { interviewStages: true },
  });
};

export const deleteJob = async (
  referenceId: string | string[],
  userID: string,
) => {
  const ids = Array.isArray(referenceId) ? referenceId : [referenceId];

  // To check if jobs exist and belong to user
  const existingJobs = await prisma.job.findMany({
    where: {
      id: { in: ids },
      userId: userID,
    },
  });

  if (existingJobs.length === 0) {
    throw new AppError("No jobs found", 404);
  }

  // To ensure ALL requested IDs exist
  if (existingJobs.length !== ids.length) {
    throw new AppError("Some jobs not found or unauthorized", 404);
  }

  await prisma.job.deleteMany({
    where: {
      id: { in: ids },
      userId: userID,
    },
  });

  return { message: "Job(s) deleted successfully" };
};
