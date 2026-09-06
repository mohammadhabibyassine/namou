import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/schemas";
import { requestBackend } from "@/lib/api/backend";
import { setAuthCookies } from "@/lib/auth/cookies";
import { hasTrustedOrigin } from "@/lib/auth/request-security";
import type { LoginResponse } from "@/types/api";
import { parseJsonBody } from "../../_shared/body";
import { invalidRequest, routeError } from "../../_shared/responses";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!hasTrustedOrigin(request))
    return invalidRequest("Untrusted origin", 403);

  try {
    const input = await parseJsonBody(request, loginSchema);
    const result = await requestBackend<LoginResponse>("/auth/login", {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        "user-agent": request.headers.get("user-agent") ?? "Namou storefront",
      },
      body: JSON.stringify(input),
    });

    const user = {
      id: result.user.id,
      role: result.user.role,
      permissions: result.user.permissions,
    };
    const response = NextResponse.json({ user });
    response.headers.set("cache-control", "no-store");
    await setAuthCookies(response.cookies, result, user);
    return response;
  } catch (error) {
    return routeError(error);
  }
}
