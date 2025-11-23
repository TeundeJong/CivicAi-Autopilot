import { createClient } from "@supabase/supabase-js";

let supabase = null;

export function getSupabaseAdmin() {
  if (supabase) return supabase;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase admin env vars not set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  }

  supabase = createClient(url, key);
  return supabase;
}
