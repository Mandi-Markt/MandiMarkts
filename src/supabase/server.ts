import { createClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  // Many people paste only the project ref; convert to full URL.
  return `https://${trimmed}.supabase.co`;
}

export function supabaseServer() {
  const urlRaw =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!urlRaw || !key) {
    throw new Error(
      "Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).",
    );
  }

  const url = normalizeSupabaseUrl(urlRaw);

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

