import { DocumentType } from "@/generated/prisma/client";

export interface DocumentFileType {
  file: Express.Multer.File;
}

export interface UploadDocumentType extends DocumentFileType {
  userId: string;
  fileType: DocumentType;
}

export interface GetDocumentType {
  fileId?: string;
  fileType?: DocumentType;
}
