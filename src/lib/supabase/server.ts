import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Supabase client for use inside Server Components, Server Actions,
 * and Route Handlers. Reads/writes the auth session via cookies so
 * the admin login persists across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Add NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. See .env.local.example."
    );
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called from a Server Component in some cases where
          // cookies cannot be written. This is safe to ignore as long as
          // middleware.ts is refreshing the session (it is, see middleware.ts).
        }
      },
    },
  });
}

/**
 * Admin client using the service_role key. This BYPASSES Row Level
 * Security entirely, so it must only ever be used in trusted server-side
 * code (Server Actions, Route Handlers) — never imported into a Client
 * Component or exposed to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase service role environment variable. Add SUPABASE_SERVICE_ROLE_KEY " +
        "to your .env.local file (Project Settings -> API -> service_role key)."
    );
  }

  return createSupabaseJsClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
