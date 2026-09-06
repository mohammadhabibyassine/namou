import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { hasTrustedOrigin } from "@/lib/auth/request-security";
import { verifySessionToken } from "@/lib/auth/session";
import { invalidRequest, routeError } from "../../_shared/responses";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasTrustedOrigin(request))
    return invalidRequest("Untrusted origin", 403);

  const refreshToken = request.cookies.get(authCookieNames.refresh)?.value;
  if (!refreshToken) return invalidRequest("Authentication required", 401);

  try {
    const tokens = await refreshAccessToken(refreshToken);
    const session = await verifySessionToken(
      request.cookies.get(authCookieNames.session)?.value,
    );
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("cache-control", "no-store");
    await setAuthCookies(response.cookies, tokens, session ?? undefined);
    return response;
  } catch (error) {
    const response = routeError(error);
    clearAuthCookies(response.cookies);
    return response;
  }
}
