import "server-only";

import { serverEnvironment } from "@/config/env.server";
import { BackendError, readErrorPayload } from "./backend-error";

export interface BackendRequestInit extends RequestInit {
  next?: NextFetchRequestConfig;
}

export function backendUrl(path: string): URL {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error("Backend paths must begin with exactly one slash");
  }

  const baseUrl = new URL(serverEnvironment.BACKEND_API_URL);
  const url = new URL(path, baseUrl);
  if (url.origin !== baseUrl.origin) {
    throw new Error("Backend path resolved outside the configured origin");
  }
  return url;
}

export async function requestBackend<T>(
  path: string,
  init: BackendRequestInit = {},
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(
    serverEnvironment.BACKEND_REQUEST_TIMEOUT_MS,
  );
  const signal = init.signal
    ? AbortSignal.any([init.signal, timeoutSignal])
    : timeoutSignal;
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");

  const response = await fetch(backendUrl(path), {
    ...init,
    headers,
    signal,
  });

  if (!response.ok) {
    throw new BackendError(response.status, await readErrorPayload(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function fetchPublicApi<T>(
  path: string,
  init: BackendRequestInit = {},
): Promise<T> {
  return requestBackend<T>(path, {
    ...init,
    next: init.next ?? { revalidate: 60 },
  });
}
