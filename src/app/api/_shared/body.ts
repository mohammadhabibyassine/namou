import type { ZodType } from "zod";

export class RequestBodyError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new RequestBodyError("Content-Type must be application/json", 415);
  }

  const maximumBytes = 64 * 1024;
  const declaredBytes = Number(request.headers.get("content-length") ?? 0);
  if (declaredBytes > maximumBytes) {
    throw new RequestBodyError("Request body is too large", 413);
  }

  const bytes = await request.arrayBuffer();
  if (bytes.byteLength > maximumBytes) {
    throw new RequestBodyError("Request body is too large", 413);
  }

  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new RequestBodyError("Request body must contain valid JSON", 400);
  }
  return schema.parse(value);
}
