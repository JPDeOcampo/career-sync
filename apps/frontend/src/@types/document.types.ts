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
