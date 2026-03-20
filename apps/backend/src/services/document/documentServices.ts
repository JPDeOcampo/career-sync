import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma";
import {
  uploadFileToStorage,
  deleteFilesFromStorage,
} from "@/utils/supabaseStorage";
import { FiltersType } from "@/@types/global.types";
import { UploadDocumentType, GetDocumentType } from "@/@types/document.types";

export const uploadDocument = async (data: UploadDocumentType) => {
  const { file, userId, fileType } = data;

  if (!file) throw new AppError("No file provided", 400);
  if (!userId) throw new AppError("User ID is required", 400);

  const existingFile = await prisma.document.findFirst({
    where: {
      userId,
      name: file.originalname,
    },
  });

  if (existingFile) {
    throw new AppError(
      "A file with this name already exists. Please rename the file or delete the old one.",
      409,
    );
  }

  if (fileType !== "CV" && fileType !== "COVER_LETTER") {
    throw new AppError("Invalid file type", 400);
  }

  // 👇 NOW returns BOTH url + path
  const { url, path } = await uploadFileToStorage(file, "documents", userId);

  const record = await prisma.document.create({
    data: {
      userId,
      fileUrl: url,
      filePath: path,
      name: file.originalname,
      type: fileType,
    },
  });

  return record;
};

export const getDocument = async ({
  userId,
  data,
  filters,
}: {
  userId: string;
  data?: GetDocumentType;
  filters: FiltersType;
}) => {
  const { fileId, fileType } = data || {};
  const { sort, page = 1, limit = 10 } = filters;

  if (!userId) throw new AppError("User ID is required", 400);

  const skip = (page - 1) * limit;

  const whereClause = {
    userId,
    ...(fileId && { id: fileId }),
    ...(fileType && { type: fileType }),
  };
  const documents = await prisma.document.findMany({
    where: whereClause,
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
    where: whereClause,
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

export const deleteDocument = async (userId: string, fileId?: string) => {
  if (!userId) throw new AppError("User ID is required", 400);

  // DELETE ALL DOCUMENTS
  if (!fileId) {
    const documents = await prisma.document.findMany({
      where: { userId },
      select: { id: true, filePath: true },
    });

    const documentIds = documents.map((doc) => doc.id);
    const filePaths = documents.map((doc) => doc.filePath);

    // Remove job references first
    await prisma.job.updateMany({
      where: { cvId: { in: documentIds } },
      data: { cvId: null },
    });

    // Delete from Supabase Storage
    if (filePaths.length > 0) {
      await deleteFilesFromStorage(filePaths);
    }

    // Delete DB records
    await prisma.document.deleteMany({
      where: { userId },
    });

    return { message: "All documents deleted successfully" };
  }

  // DELETE SINGLE DOCUMENT
  const document = await prisma.document.findFirst({
    where: { id: fileId, userId },
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Remove job references
  await prisma.job.updateMany({
    where: { cvId: fileId },
    data: { cvId: null },
  });

  await deleteFilesFromStorage([document.filePath]);

  await prisma.document.delete({
    where: { id: fileId },
  });

  return { message: "Document deleted successfully" };
};
