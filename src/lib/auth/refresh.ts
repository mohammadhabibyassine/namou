import "server-only";

import type { TokenPair } from "@/types/api";
import { requestBackend } from "@/lib/api/backend";

export function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  return requestBackend<TokenPair>("/auth/refresh", {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
}
