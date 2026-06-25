import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];

/**
 * Middleware function to handle authentication and authorization.
 * @param request - The incoming request.
 * @returns The response.
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  if (pathname === "/login" && token) {
    return NextResponse.redirect(
      new URL(role === "reviewer" ? "/queue" : "/applications", request.url)
    );
  }

  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
