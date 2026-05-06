import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function normalizeSupabaseUrl(raw: string) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}.supabase.co`;
}

export function supabaseBrowser() {
  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!urlRaw || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const url = normalizeSupabaseUrl(urlRaw);
  return createSupabaseClient(url, key);
}

// Alias for compatibility
export const createClient = supabaseBrowser;

