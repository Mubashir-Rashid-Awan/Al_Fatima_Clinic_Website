import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proxy (formerly "middleware" in Next.js 15): protects every /admin route
// except /admin/login itself.
// Unauthenticated visitors are redirected to the login page.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase env vars are not yet configured, let requests through
  // rather than crashing the whole site — admin routes will simply
  // show a "not configured" message (see src/app/admin/layout.tsx).
  if (!url || !anonKey) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch {
    // Supabase unreachable or misconfigured — treat as unauthenticated.
    user = null;
  }

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const redirectUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginRoute && user) {
    const redirectUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
