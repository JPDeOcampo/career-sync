import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma.js";
import { JobApplication } from "@career-sync/shared";
import { getRecentDate } from "@career-sync/shared";

// --- Add Job Logic ---p
const buildJobCreateData = (job: JobApplication, userId: string) => ({
  id: job.id,
  company: job.company,
  roleTitle: job.roleTitle,
  jobDescription: job.jobDescription,
  jobType: job.jobType,
  salary: job.salary,
  workSetup: job.workSetup,
  workSchedule: job.workSchedule,
  location: job.location,
  jobLink: job.jobLink,
  applicationMethod: job.applicationMethod,
  applicationDate: job.applicationDate
    ? new Date(job.applicationDate)
    : undefined,
  status: job.status,
  priority: job.priority,
  contact: job.contact,
  offer: job.offer,
  notes: job.notes,

  user: {
    connect: {
      id: userId,
    },
  },

  ...(job.cvId && {
    cv: {
      connect: {
        id: job.cvId,
      },
    },
  }),

  ...(job.coverLetterId && {
    coverLetter: {
      connect: {
        id: job.coverLetterId,
      },
    },
  }),

  ...(job.interviewStages?.length
    ? {
        interviewStages: {
          create: job.interviewStages.map((stage) => ({
            id: stage.id,
            interviewType: stage.interviewType,
            interviewDate: stage.interviewDate
              ? new Date(stage.interviewDate)
              : undefined,
            interviewTime: stage.interviewTime,
            interviewerName: stage.interviewerName,
            interviewComment: stage.interviewComment,
          })),
        },
      }
    : {}),
});

const createJobs = async (jobs: JobApplication[], userId: string) => {
  // Verify user once
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Validate duplicate job IDs
  const jobIds = jobs.map((job) => job.id).filter(Boolean) as string[];

  if (jobIds.length > 0) {
    const existingJobs = await prisma.job.findMany({
      where: {
        id: {
          in: jobIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingJobs.length > 0) {
      throw new AppError(
        `Job ID already exists: ${existingJobs
          .map((job) => job.id)
          .join(", ")}`,
        400,
      );
    }
  }

  // Validate CVs
  const cvIds = jobs.map((job) => job.cvId).filter(Boolean) as string[];

  if (cvIds.length > 0) {
    const cvs = await prisma.document.findMany({
      where: {
        id: {
          in: cvIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundCvIds = new Set(cvs.map((cv) => cv.id));

    const missingCvIds = cvIds.filter((id) => !foundCvIds.has(id));

    if (missingCvIds.length > 0) {
      throw new AppError(
        `CV documents not found: ${missingCvIds.join(", ")}`,
        400,
      );
    }
  }

  // Validate Cover Letters
  const coverLetterIds = jobs
    .map((job) => job.coverLetterId)
    .filter(Boolean) as string[];

  if (coverLetterIds.length > 0) {
    const coverLetters = await prisma.document.findMany({
      where: {
        id: {
          in: coverLetterIds,
        },
      },
      select: {
        id: true,
      },
    });

    const foundCoverLetterIds = new Set(coverLetters.map((doc) => doc.id));

    const missingCoverLetterIds = coverLetterIds.filter(
      (id) => !foundCoverLetterIds.has(id),
    );

    if (missingCoverLetterIds.length > 0) {
      throw new AppError(
        `Cover letter documents not found: ${missingCoverLetterIds.join(", ")}`,
        400,
      );
    }
  }

  if (!jobs || jobs.length === 0) {
    return [];
  }

  // If there is only 1 job, run it directly without a transaction
  if (jobs.length === 1) {
    const singleCreated = await prisma.job.create({
      data: buildJobCreateData(jobs[0], userId),
      include: {
        interviewStages: true,
        cv: true,
        coverLetter: true,
      },
    });
    return [singleCreated];
  }

  // Only include the transaction if jobs.length > 1
  return prisma.$transaction(
    async (tx) => {
      const created = await Promise.all(
        jobs.map((job) =>
          tx.job.create({
            data: buildJobCreateData(job, userId),
          }),
        ),
      );

      return created;
    },
    {
      timeout: 20000,
    },
  );
};

export const addJob = async (
  data: JobApplication | JobApplication[],
  userId: string,
) => {
  const jobs = Array.isArray(data) ? data : [data];

  const createdJobs = await createJobs(jobs, userId);

  return Array.isArray(data) ? createdJobs : createdJobs[0];
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
        ...(limit > 0 && { skip, take: limit }),
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
  userId: string,
) => {
  const ids = Array.isArray(referenceId) ? referenceId : [referenceId];

  // To check if jobs exist and belong to user
  const existingJobs = await prisma.job.findMany({
    where: {
      id: { in: ids },
      userId: userId,
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
      userId: userId,
    },
  });

  return { message: "Job(s) deleted successfully" };
};

export const deleteAllJobs = async (userId: string) => {
  const result = await prisma.job.deleteMany({
    where: {
      userId,
    },
  });

  if (result.count === 0) {
    throw new AppError(
      "No jobs to delete. Please add some jobs first before deleting.",
      404,
    );
  }

  return { message: "All jobs deleted successfully" };
};
