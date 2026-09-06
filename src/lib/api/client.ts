import { BackendError, readErrorPayload } from "./backend-error";

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiClient<T>(
  path: string,
  options: ApiClientOptions = {},
): Promise<T> {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("API paths must begin with exactly one slash");
  }

  const { body: payload, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers);
  headers.set("accept", "application/json");

  let body: BodyInit | undefined;
  if (payload !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(payload);
  }

  const init: RequestInit = {
    ...requestOptions,
    headers,
    credentials: "same-origin",
  };
  if (body !== undefined) init.body = body;

  const response = await fetch(`/api/backend${path}`, init);

  if (!response.ok) {
    throw new BackendError(response.status, await readErrorPayload(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
