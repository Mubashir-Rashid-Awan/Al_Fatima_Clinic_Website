import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

/**
 * Supabase client for use inside Client Components ("use client").
 * Reads the public URL + anon key from environment variables.
 * These two are safe to expose to the browser — they only work
 * within the permissions granted by the Row Level Security policies
 * in supabase/schema.sql.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. See .env.local.example."
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
