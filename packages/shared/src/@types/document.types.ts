import { FiltersDTO } from "./global.types";

export type Documents = {
  id: string;
  userId?: string;
  type: string;
  fileUrl: string;
  filePath: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
  isUploading?: boolean;
  progress?: number;
};

export type DocumentsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  fileType?: "ALL" | "CV" | "COVER_LETTER";
  sort?: string;
};

export type DocumentType = "CV" | "COVER_LETTER";

export interface DocumentsFiltersDTO extends FiltersDTO {
  fileType?: "CV" | "COVER_LETTER";
  fileId?: string;
}
