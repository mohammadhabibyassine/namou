import type { ApiErrorPayload } from "@/types/api";

export class BackendError extends Error {
  readonly status: number;
  readonly payload: ApiErrorPayload | null;

  constructor(status: number, payload: ApiErrorPayload | null) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join("; ")
      : (payload?.message ?? `Backend request failed with status ${status}`);

    super(message);
    this.name = "BackendError";
    this.status = status;
    this.payload = payload;
  }
}

export async function readErrorPayload(
  response: Response,
): Promise<ApiErrorPayload | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;

  try {
    return (await response.json()) as ApiErrorPayload;
  } catch {
    return null;
  }
}
