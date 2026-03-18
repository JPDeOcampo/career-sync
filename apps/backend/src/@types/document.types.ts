export type FileType = "CV" | "COVER_LETTER";

export interface DocumentFileType {
  file: Express.Multer.File;
}

export interface UploadDocumentType extends DocumentFileType {
  userId: string;
  fileType: FileType;
}

export interface GetDocumentType {
  fileId: string;
  fileType: FileType;
}
