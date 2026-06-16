import { AppError } from "@/utils/errors/appError.js";
import { prisma } from "@/lib/prisma";
import {
  uploadFileToStorage,
  deleteFilesFromStorage,
  // signedUrlFromStorage,
  downloadFileFromStorage,
} from "@/utils/supabaseStorage";
import { DocumentsFiltersDTO } from "@career-sync/shared";
import { UploadDocumentDTO } from "@/@types/document.types";
// import { Documents } from "@career-sync/shared";

export const uploadDocument = async (data: UploadDocumentDTO) => {
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
    if (existingFile.type === fileType) {
      throw new AppError("File already exists with same type", 409);
    }

    throw new AppError(
      "A file with this name already exists. Please rename the file or delete the old one.",
      409,
    );
  }

  if (fileType !== "CV" && fileType !== "COVER_LETTER") {
    throw new AppError("Invalid file type", 400);
  }

  const { url, path } = await uploadFileToStorage(file, "documents", userId);

  const filename = path.split("/").pop();

  const record = await prisma.document.create({
    data: {
      userId,
      fileUrl: url,
      filePath: path,
      name: file.originalname,
      type: fileType,
    },
  });

  return {
    ...record,
    fileUrl: `${process.env.BACKEND_URL}/api/v1/document/${userId}/${filename}`,
  };
};

export const getDocument = async ({
  userId,
  filters,
}: {
  userId: string;
  filters: DocumentsFiltersDTO;
}) => {
  const { sort, search, fileId, fileType, page = 1, limit = 5 } = filters;

  if (!userId) throw new AppError("User ID is required", 400);

  const skip = (page - 1) * limit;
  const isValid = (val?: string) =>
    val && val !== "All" && val !== "ALL" && val.trim() !== "";

  const whereClause = {
    userId,
    ...(fileId && { id: fileId }),
    ...(isValid(fileType) && { type: fileType }),
    ...(isValid(search) && {
      OR: [{ name: { contains: search, mode: "insensitive" as const } }],
    }),
  };

  const documents = await prisma.document.findMany({
    where: whereClause,
    orderBy:
      sort === "recent"
        ? { createdAt: "desc" }
        : sort === "oldest"
          ? { createdAt: "asc" }
          : { createdAt: "desc" },
    ...(limit > 0 && { skip, take: limit }),
  });

  // --- Generate Signed URLs ---
  // const documentsWithUrls = await Promise.all(
  //   documents.map(async (doc) => {
  //     // Generate a signed URL valid for 1 hour (3600 seconds)
  //     const signedData = await signedUrlFromStorage(doc as Documents);
  //     return {
  //       ...doc,
  //       fileUrl: signedData?.signedUrl,
  //     };
  //   }),
  // );
  const documentsWithCleanUrls = documents.map((doc) => {
    // "user_123/my_resume.pdf"
    const filename = doc.filePath.split("/").pop();

    return {
      ...doc,
      fileUrl: `${process.env.BACKEND_URL}/api/v1/document/${doc.userId}/${filename}`,
    };
  });

  const totalDocuments = await prisma.document.count({
    where: whereClause,
  });

  return {
    documents: documentsWithCleanUrls,
    pagination: {
      total: totalDocuments,
      page,
      limit,
      totalPages: Math.ceil(totalDocuments / limit),
    },
  };
};

export const deleteDocument = async (userId: string, fileId?: string[]) => {
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }

  const fileIds = fileId ? (Array.isArray(fileId) ? fileId : [fileId]) : null;

  //DELETE ALL DOCUMENTS
  if (!fileIds) {
    const documents = await prisma.document.findMany({
      where: { userId },
      select: { id: true, filePath: true },
    });

    const documentIds = documents.map((doc) => doc.id);
    const filePaths = documents.map((doc) => doc.filePath);

    // Remove job references
    await prisma.job.updateMany({
      where: {
        cvId: { in: documentIds },
        coverLetterId: { in: documentIds },
      },
      data: {
        cvId: null,
        coverLetterId: null,
      },
    });

    // Delete files from storage
    if (filePaths.length > 0) {
      await deleteFilesFromStorage(filePaths);
    }

    // Delete documents
    await prisma.document.deleteMany({
      where: { userId },
    });

    return {
      message: "All documents deleted successfully",
    };
  }

  // DELETE ONE OR MULTIPLE DOCUMENTS
  const documents = await prisma.document.findMany({
    where: {
      id: { in: fileIds },
      userId,
    },
    select: {
      id: true,
      filePath: true,
    },
  });

  if (documents.length === 0) {
    throw new AppError("Document(s) not found", 404);
  }

  const documentIds = documents.map((doc) => doc.id);
  const filePaths = documents.map((doc) => doc.filePath);

  // Remove job references
  await prisma.job.updateMany({
    where: {
      cvId: { in: documentIds },
      coverLetterId: { in: documentIds },
    },
    data: {
      cvId: null,
      coverLetterId: null,
    },
  });

  // Delete files from storage
  await deleteFilesFromStorage(filePaths);

  // Delete documents
  await prisma.document.deleteMany({
    where: {
      id: { in: documentIds },
      userId,
    },
  });

  return {
    message:
      documentIds.length === 1
        ? "Document deleted successfully"
        : "Documents deleted successfully",
  };
};

export const getCleanedURLDocument = async ({
  userId,
  filename,
}: {
  userId: string;
  filename: string;
}) => {
  const filePath = `${userId}/${filename}`;

  const data = downloadFileFromStorage(filePath);

  if (!data) {
    throw new AppError("File not found in S3");
  }

  return data;
};
