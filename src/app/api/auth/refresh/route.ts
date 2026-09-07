import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/lib/auth/constants";
import { clearAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { hasTrustedOrigin } from "@/lib/auth/request-security";
import { requestBackend } from "@/lib/api/backend";
import type { SessionUser } from "@/types/api";
import { invalidRequest, routeError } from "../../_shared/responses";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasTrustedOrigin(request))
    return invalidRequest("Untrusted origin", 403);

  const refreshToken = request.cookies.get(authCookieNames.refresh)?.value;
  if (!refreshToken) return invalidRequest("Authentication required", 401);

  try {
    const tokens = await refreshAccessToken(refreshToken);
    const session = await requestBackend<{ user: SessionUser }>(
      "/auth/session",
      {
        cache: "no-store",
        headers: { authorization: `Bearer ${tokens.accessToken}` },
      },
    );
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("cache-control", "no-store");
    await setAuthCookies(response.cookies, tokens, session.user);
    return response;
  } catch (error) {
    const response = routeError(error);
    clearAuthCookies(response.cookies);
    return response;
  }
}
