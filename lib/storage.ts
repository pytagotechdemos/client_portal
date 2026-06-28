import { createClient } from "@supabase/supabase-js";

// Verify env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<{ url: string; error: any }> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (error) {
    console.error("Supabase upload error:", error);
    return { url: "", error };
  }
}
