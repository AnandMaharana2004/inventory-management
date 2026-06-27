import { NextResponse, type NextRequest } from "next/server";

import { AuthenticatinNeed } from "@/lib/auth";

const masterRoutePermissions: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/items": ["ADMIN", "MANAGER"],
  "/venders": ["ADMIN", "MANAGER"],
  "/discounts": ["ADMIN", "MANAGER"],
};

export async function proxy(request: NextRequest) {
  try {
    const user = await AuthenticatinNeed(request);
    const pathname = request.nextUrl.pathname;
    const requiredRoles = getRequiredRoles(pathname);

    if (requiredRoles && (!user.role || !requiredRoles.includes(String(user.role)))) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

function getRequiredRoles(pathname: string) {
  const matchedRoute = Object.keys(masterRoutePermissions).find(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  return matchedRoute ? masterRoutePermissions[matchedRoute] : null;
}
