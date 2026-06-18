import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes, protectedRoutes } from "@/constant/routesPath";

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Normalize the pathname (remove trailing slash except for root)
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // Strict or accurate matching depending on array structures
  // Using exact match or making sure that it don't accidentally match '/' to everything
  const isPublic = publicRoutes.some((path) =>
    path === "/" ? normalizedPath === "/" : normalizedPath.startsWith(path),
  );

  const isProtected = protectedRoutes.some((path) =>
    path === "/" ? normalizedPath === "/" : normalizedPath.startsWith(path),
  );

  const loggedIn = request.cookies.get("refreshToken")?.value;

  // --- USER IS LOGGED IN ---
  if (loggedIn) {
    // If user are on a public page (like /login or /landing), kick them to dashboard
    if (isPublic && normalizedPath !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // If user are going to an invalid/undefined route, send them to dashboard
    if (!isProtected && normalizedPath !== "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // --- USER IS NOT LOGGED IN ---
  if (!loggedIn) {
    if (isPublic) {
      return NextResponse.next();
    }

    if (normalizedPath === "/login") {
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
