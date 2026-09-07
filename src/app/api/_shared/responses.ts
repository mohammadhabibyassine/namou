import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BackendError } from "@/lib/api/backend-error";
import { RequestBodyError } from "./body";

export function noStoreJson<T>(body: T, init?: ResponseInit): NextResponse<T> {
  const response = NextResponse.json(body, init);
  response.headers.set("cache-control", "no-store");
  return response;
}

export function routeError(error: unknown): NextResponse {
  if (error instanceof RequestBodyError) {
    return invalidRequest(error.message, error.status);
  }

  if (error instanceof ZodError) {
    return noStoreJson(
      {
        statusCode: 400,
        message: error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  if (error instanceof BackendError) {
    return noStoreJson(
      error.payload ?? {
        statusCode: error.status,
        message: error.message,
      },
      { status: error.status },
    );
  }

  return noStoreJson(
    { statusCode: 500, message: "An unexpected server error occurred" },
    { status: 500 },
  );
}

export function invalidRequest(message: string, status = 400): NextResponse {
  return noStoreJson({ statusCode: status, message }, { status });
}
