import { DocumentType } from "@/generated/prisma/client";

export interface DocumentFileDTO {
  file: Express.Multer.File;
}

export interface UploadDocumentDTO extends DocumentFileDTO {
  userId: string;
  fileType: DocumentType;
}

export interface GetDocumentDTO {
  fileId?: string;
  fileType?: DocumentType;
}
