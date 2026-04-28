import { apiClient } from "@/integrations/api/client";

export async function uploadImage(file: File, folder: string): Promise<string> {
  const { data, error } = await apiClient.uploadImage(file, folder);
  if (error) throw new Error(error);
  if (!data?.url) throw new Error("Upload tidak mengembalikan URL gambar");
  return data.url;
}
