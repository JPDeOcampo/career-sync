import { Request, Response } from "express";
import * as documentService from "@/services/document/documentServices";

export const uploadDocumentController = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const file = req.file as Express.Multer.File;
  const { fileType } = req.body;

  const data = await documentService.uploadDocument({ userId, file, fileType });

  return res.status(200).json({
    message: "Document upload successfully",
    data: data,
  });
};

export const getDocumentController = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const body = req.body;
  const filters = req.query;

  const data = await documentService.getDocument({
    userId,
    data: body,
    filters,
  });

  return res.status(200).json({
    message: "Documents fetched successfully",
    ...data,
  });
};

export const deleteDocumentController = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { fileId } = req.params as { fileId: string };

  await documentService.deleteDocument(userId, fileId);

  return res.status(200).json({
    message: "Document deleted successfully",
  });
};

export const getCleanedURLDocument = async (req: Request, res: Response) => {
  // const userId = req.user?.id as string;
  const { userId, filename } = req.params as {
    userId: string;
    filename: string;
  };

  const data = await documentService.getCleanedURLDocument({
    userId,
    filename,
  });

  if (!data) throw new Error("File not found in S3");

  const buffer = Buffer.from(await data.arrayBuffer());

  // Set the headers so the browser knows how to handle the file
  res.setHeader("Content-Type", data.type || "application/pdf");

  // 'inline' shows it in the browser; 'attachment' forces a download
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

  return res.send(buffer);
};
