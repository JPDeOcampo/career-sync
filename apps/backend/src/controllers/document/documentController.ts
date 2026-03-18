import { Request, Response } from "express";
import * as uploadService from "@/services/upload/documentServices";

export const uploadDocumentController = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const file = req.file as Express.Multer.File;
  const { fileType } = req.body;

  const data = await uploadService.uploadDocument({ userId, file, fileType });

  return res.status(200).json({
    message: "Upload successful",
    data: data,
  });
};

export const getDocumentController = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const body = req.body;
  const filters = req.query;

  const data = await uploadService.getDocument(userId, body, filters);

  return res.status(200).json({
    success: true,
    data: data,
  });
};
