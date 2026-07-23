import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';


// Client for browser / public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for uploading files to Supabase Storage Bucket
export async function uploadPdfToSupabase(fileBuffer, fileName, mimeType) {
  const filePath = `documents/${Date.now()}_${fileName}`;

  const { data, error } = await supabase.storage
    .from('learnozi-docs')
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('learnozi-docs')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}
