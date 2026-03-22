import { createClient } from "@supabase/supabase-js";
import { Documents } from "@career-sync/shared";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export const uploadFileToStorage = async (
  file: Express.Multer.File,
  bucket: string,
  userId: string,
) => {
  // Generate a unique path: userId/timestamp-filename
  const filePath = `${userId}/${Date.now()}-${file.originalname}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) throw error;

  // Get the URL to store in the DB
  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
};

export const deleteFilesFromStorage = async (filePaths: string[]) => {
  if (!filePaths.length) return;

  const { error } = await supabaseAdmin.storage
    .from("documents")
    .remove(filePaths);

  if (error) throw error;
};

export const signedUrlFromStorage = async (doc: Documents) => {
  if (!doc) return;

  const { data: signedData, error } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(doc.filePath, 3600);

  if (error) throw error;

  return signedData;
};

export const downloadFileFromStorage = async (filePath: string) => {
  if (!filePath) return;

  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .download(filePath);

  if (error) throw error;

  return data;
};
