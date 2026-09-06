import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { serverEnvironment } from "@/config/env.server";
import type { Permission, SessionUser } from "@/types/api";
import { authCookieNames } from "./constants";

const sessionUserSchema = z.object({
  id: z.uuid(),
  role: z.string().min(1),
  permissions: z.array(z.string()),
});

const sessionKey = new TextEncoder().encode(
  serverEnvironment.AUTH_SESSION_SECRET,
);

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${serverEnvironment.AUTH_REFRESH_TTL_DAYS}d`)
    .sign(sessionKey);
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionKey, {
      algorithms: ["HS256"],
    });
    const parsed = sessionUserSchema.safeParse({
      id: payload.sub,
      role: payload.role,
      permissions: payload.permissions,
    });

    if (!parsed.success) return null;
    return {
      ...parsed.data,
      permissions: parsed.data.permissions as Permission[],
    };
  } catch {
    return null;
  }
}

export const getSession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(authCookieNames.session)?.value);
});

export function hasPermission(
  user: SessionUser | null,
  permission: Permission,
): boolean {
  return Boolean(user?.permissions.includes(permission));
}

export function hasAnyPermission(
  user: SessionUser | null,
  required: readonly Permission[],
): boolean {
  return Boolean(
    user && required.some((item) => user.permissions.includes(item)),
  );
}
