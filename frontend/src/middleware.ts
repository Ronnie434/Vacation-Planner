import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes accessible without authentication
const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"];

// Auth pages that should redirect to / when already logged in
const authOnlyRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("JWT")?.value;

  // API routes: proxy to backend with explicit cookie forwarding
  if (pathname.startsWith("/api/")) {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:10000";
    const apiPath = pathname.replace(/^\/api/, "/v1");
    const url = new URL(apiPath + request.nextUrl.search, backendUrl);

    const requestHeaders = new Headers(request.headers);
    if (token) {
      requestHeaders.set("cookie", `JWT=${token}`);
    }

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Redirect unauthenticated users to login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (not /)
  const isAuthRoute = authOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
