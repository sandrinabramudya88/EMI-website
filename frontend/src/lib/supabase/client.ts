import { createClient } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createClient> | null | undefined;

/**
 * Inisialisasi klien browser Supabase untuk operasi database cloud.
 * Klien ini hanya dibuat jika variabel lingkungan NEXT_PUBLIC_SUPABASE_URL 
 * dan NEXT_PUBLIC_SUPABASE_ANON_KEY telah dikonfigurasi.
 */
export function createSupabaseBrowserClient() {
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Jika variabel lingkungan tidak ada (default offline mode), return null
  if (!url || !key) {
    browserClient = null;
    return null;
  }

  // Membuat klien Supabase untuk berkomunikasi dengan database cloud
  browserClient = createClient(url, key);
  return browserClient;
}
