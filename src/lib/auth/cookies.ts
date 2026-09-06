import "server-only";

import { serverEnvironment } from "@/config/env.server";
import type { SessionUser, TokenPair } from "@/types/api";
import { authCookieNames } from "./constants";
import { createSessionToken } from "./session";

const secure = process.env.NODE_ENV === "production";
const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure,
  path: "/",
};

interface CookieWriter {
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      maxAge: number;
    },
  ): unknown;
}

export async function setAuthCookies(
  cookies: CookieWriter,
  tokens: TokenPair,
  user?: SessionUser,
): Promise<void> {
  cookies.set(authCookieNames.access, tokens.accessToken, {
    ...baseCookie,
    maxAge: tokens.expiresIn,
  });
  cookies.set(authCookieNames.refresh, tokens.refreshToken, {
    ...baseCookie,
    maxAge: serverEnvironment.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60,
  });

  if (user) {
    cookies.set(authCookieNames.session, await createSessionToken(user), {
      ...baseCookie,
      maxAge: serverEnvironment.AUTH_REFRESH_TTL_DAYS * 24 * 60 * 60,
    });
  }
}

export function clearAuthCookies(cookies: CookieWriter): void {
  for (const name of Object.values(authCookieNames)) {
    cookies.set(name, "", { ...baseCookie, maxAge: 0 });
  }
}
