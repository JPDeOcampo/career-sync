import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const proxy = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "");

  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-code",
    "/reset-password",
  ];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  const loggedIn = request.cookies.get("refreshToken")?.value;

  if (loggedIn) {
    if (isPublic) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const definedRoutes = [
      "/dashboard",
      "/jobs",
      "/kanban",
      "/calendar",
      "/profile",
    ];
    const isDefinedRoute = definedRoutes.some((path) =>
      pathname.startsWith(path),
    );

    if (!isDefinedRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (!loggedIn) {
    if (isPublic) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/((?!api|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)$).*)",
  ],
};
