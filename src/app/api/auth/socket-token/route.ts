import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";
import { invalidRequest } from "../../_shared/responses";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await verifySessionToken(
    request.cookies.get(authCookieNames.session)?.value,
  );
  if (!session) return invalidRequest("Authentication required", 401);

  const accessToken = request.cookies.get(authCookieNames.access)?.value;
  if (!accessToken) return invalidRequest("Authentication required", 401);

  const response = NextResponse.json({ token: accessToken });
  response.headers.set("cache-control", "no-store, private");
  response.headers.set("pragma", "no-cache");
  return response;
}
