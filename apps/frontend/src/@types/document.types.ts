export type DocumentType = {
  id: string;
  userId?: string;
  type: string;
  fileUrl: string;
  name: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  isUploading?: boolean;
  progress?: number;
};

export type FiltersType = {
  page?: number;
  limit?: number;
  search?: string;
  fileType?: "ALL" | "CV" | "COVER_LETTER";
  sort?: string;
};
