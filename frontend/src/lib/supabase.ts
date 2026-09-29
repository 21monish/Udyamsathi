import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Upload an applicant document (Aadhaar, Caste Certificate, DPR, etc.) to Supabase Storage.
 * @param file The File object from an <input type="file" />
 * @param path Storage file path (e.g. `user_id/aadhaar_card.pdf`)
 * @param bucket Storage bucket name (default: 'documents')
 */
export async function uploadDocument(
  file: File,
  path: string,
  bucket: string = 'documents'
) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Get the public download/view URL of an uploaded document.
 */
export function getDocumentUrl(path: string, bucket: string = 'documents') {
  if (!supabase) return '';
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
