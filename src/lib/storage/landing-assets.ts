import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "landing-assets";
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export function validateLogoFile(file: File): void {
  if (!file || file.size === 0) {
    return;
  }

  if (!MIME_TO_EXTENSION[file.type]) {
    throw new Error("Logo must be a PNG, JPG, JPEG, or WEBP image.");
  }

  if (file.size > MAX_LOGO_SIZE) {
    throw new Error("Logo must be 5 MB or smaller.");
  }
}

export async function uploadLandingLogo(
  file: File,
  publicCode: string
): Promise<{ path: string; publicUrl: string }> {
  validateLogoFile(file);

  if (file.size === 0) {
    throw new Error("Cannot upload an empty logo file.");
  }

  const supabase = getSupabaseAdminClient();
  const extension = MIME_TO_EXTENSION[file.type];
  const path = `logos/${publicCode}/logo-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error("Unable to upload landing page logo.");
  }

  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return {
    path,
    publicUrl: data.publicUrl,
  };
}
