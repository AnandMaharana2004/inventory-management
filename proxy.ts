import { NextResponse, type NextRequest } from "next/server";

const TOKEN_COOKIE_NAMES = ["auth-token", "token"];

export function proxy(request: NextRequest) {
  const token = TOKEN_COOKIE_NAMES.map((name) => request.cookies.get(name)?.value).find(Boolean);

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
