import { NextRequest, NextResponse } from "next/server";
import { serverEnvironment } from "@/config/env.server";
import { backendUrl } from "@/lib/api/backend";
import { authCookieNames } from "@/lib/auth/constants";
import { hasTrustedOrigin } from "@/lib/auth/request-security";
import { invalidRequest } from "../../_shared/responses";
import { findRoutePolicy } from "./policy";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const MAX_PROXY_BODY_BYTES = 1_000_000;

async function proxyRequest(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  if (!hasTrustedOrigin(request))
    return invalidRequest("Untrusted origin", 403);

  const { path: segments } = await context.params;
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  ) {
    return invalidRequest("Invalid backend path");
  }

  const path = `/${segments.map(encodeURIComponent).join("/")}`;
  const policy = findRoutePolicy(path, request.method);
  if (!policy) return invalidRequest("Backend route is not exposed", 404);

  const accessToken = request.cookies.get(authCookieNames.access)?.value;
  let requestBody: ArrayBuffer | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_PROXY_BODY_BYTES) {
      return invalidRequest("Request body is too large", 413);
    }
    try {
      requestBody = await request.arrayBuffer();
    } catch {
      return invalidRequest("Unable to read request body");
    }
    if (requestBody.byteLength > MAX_PROXY_BODY_BYTES) {
      return invalidRequest("Request body is too large", 413);
    }
    const contentType = request.headers.get("content-type");
    if (
      requestBody.byteLength > 0 &&
      !contentType?.includes("application/json")
    ) {
      return invalidRequest("Only JSON request bodies are supported", 415);
    }
  }

  if (policy.requiresAuth && !accessToken) {
    return invalidRequest("Authentication required", 401);
  }

  const execute = (token: string | undefined) => {
    const headers = new Headers();
    headers.set("accept", request.headers.get("accept") ?? "application/json");
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    if (token) headers.set("authorization", `Bearer ${token}`);
    const userAgent = request.headers.get("user-agent");
    if (userAgent) headers.set("user-agent", userAgent);

    const target = backendUrl(`${path}${request.nextUrl.search}`);
    return fetch(target, {
      method: request.method,
      headers,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(serverEnvironment.BACKEND_REQUEST_TIMEOUT_MS),
      body: requestBody,
    });
  };

  try {
    const backendResponse = await execute(accessToken);

    const responseHeaders = new Headers();
    const responseContentType = backendResponse.headers.get("content-type");
    if (responseContentType) {
      responseHeaders.set("content-type", responseContentType);
    }
    responseHeaders.set("cache-control", "no-store");

    const response = new NextResponse(
      backendResponse.status === 204 ? null : backendResponse.body,
      {
        status: backendResponse.status,
        headers: responseHeaders,
      },
    );
    return response;
  } catch {
    return invalidRequest("The backend is currently unavailable", 502);
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
