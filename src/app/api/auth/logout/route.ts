import { NextRequest, NextResponse } from "next/server";
import { serverEnvironment } from "@/config/env.server";
import { requestBackend } from "@/lib/api/backend";
import { authCookieNames } from "@/lib/auth/constants";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { hasTrustedOrigin } from "@/lib/auth/request-security";
import { invalidRequest } from "../../_shared/responses";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasTrustedOrigin(request, serverEnvironment.SITE_URL))
    return invalidRequest("Untrusted origin", 403);

  const refreshToken = request.cookies.get(authCookieNames.refresh)?.value;
  if (refreshToken) {
    try {
      await requestBackend<void>("/auth/logout", {
        method: "POST",
        cache: "no-store",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Local credentials must still be cleared if the backend is unavailable.
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.headers.set("cache-control", "no-store");
  clearAuthCookies(response.cookies);
  return response;
}
