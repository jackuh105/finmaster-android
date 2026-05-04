import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  // Wrap in try-catch to handle invalid/expired refresh tokens gracefully.
  let user = null;
  try {
    const { data } = await supabase.auth.getClaims();
    user = data?.claims;
  } catch (error) {
    // If the refresh token is invalid (e.g., from a previous session),
    // clear the auth cookies and treat the user as unauthenticated.
    console.warn("Auth session refresh failed, clearing invalid session:", error);

    // Clear Supabase auth cookies to prevent repeated errors
    supabaseResponse.cookies.delete("sb-access-token");
    supabaseResponse.cookies.delete("sb-refresh-token");
    // Also clear the cookie with the project reference prefix if it exists
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
    if (projectRef) {
      supabaseResponse.cookies.delete(`sb-${projectRef}-auth-token`);
    }
  }
  const isRestricted = request.cookies.get("auth-restricted")?.value === "true";

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/api")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && !isRestricted && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Check for restricted state
  if (user && isRestricted) {
    // If restricted, only allow access to reset-password page
    if (!request.nextUrl.pathname.startsWith("/auth/reset-password")) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/reset-password";
      return NextResponse.redirect(url);
    }
  } else if (
    !user &&
    request.nextUrl.pathname.startsWith("/auth/reset-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
