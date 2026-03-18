import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma";
import { uploadFileToStorage } from "@/utils/supabaseStorage";
import { FiltersType } from "@/@types/global.types";
import { UploadDocumentType, GetDocumentType } from "@/@types/document.types";

export const uploadDocument = async (data: UploadDocumentType) => {
  const { file, userId, fileType } = data;
  console.log(data);

  if (!file) throw new AppError("No file provided", 400);
  if (!userId) throw new AppError("User ID is required", 400);

  // --- CHECK FOR EXISTING FILENAME ---
  const existingFile = await prisma.document.findFirst({
    where: {
      userId: userId,
      name: file.originalname,
    },
  });

  if (existingFile) {
    throw new AppError(
      "A file with this name already exists. Please rename the file or delete the old one.",
      409,
    );
  }
  // ----------------------------------------

  let record;

  if (fileType === "CV" || fileType === "COVER_LETTER") {
    const url = await uploadFileToStorage(file, "documents", userId);

    record = await prisma.document.create({
      data: {
        userId: userId,
        fileUrl: url,
        name: file.originalname,
        type: fileType,
      },
    });
  } else {
    throw new AppError("Invalid file type", 400);
  }

  return record;
};

export const getDocument = async (
  userId: string,
  data: GetDocumentType,
  filters: FiltersType,
) => {
  const { fileId, fileType } = data;
  const { sort, page = 1, limit = 10 } = filters;

  if (!userId) throw new AppError("User ID is required", 400);

  const skip = (page - 1) * limit;

  const documents = await prisma.document.findMany({
    where: {
      userId: userId,
      ...(fileId && { type: fileId }),
      ...(fileType && { type: fileType }),
    },
    orderBy:
      sort === "recent"
        ? { createdAt: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : undefined,

    skip,
    take: limit,
  });

  const totalDocuments = await prisma.document.count({
    where: {
      userId: userId,
      ...(fileId && { type: fileId }),
      ...(fileType && { type: fileType }),
    },
  });

  return {
    documents,
    pagination: {
      total: totalDocuments,
      page,
      limit,
      totalPages: Math.ceil(totalDocuments / limit),
    },
  };
};
