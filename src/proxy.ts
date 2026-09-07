import { NextRequest, NextResponse } from "next/server";
import { authCookieNames, protectedRoutePrefixes } from "@/lib/auth/constants";

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const requiresAuthentication = protectedRoutePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!requiresAuthentication) return NextResponse.next();

  const hasSessionCookie = Boolean(
    request.cookies.get(authCookieNames.session)?.value,
  );
  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/order-confirmation/:path*",
    "/admin/:path*",
  ],
};
