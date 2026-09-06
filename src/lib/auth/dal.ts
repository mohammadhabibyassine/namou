import "server-only";

import { redirect } from "next/navigation";
import type { Permission, SessionUser } from "@/types/api";
import { getSession, hasAnyPermission, hasPermission } from "./session";

export async function requireSession(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireSession();
  if (!hasPermission(user, permission)) redirect("/");
  return user;
}

export async function requireAnyPermission(
  required: readonly Permission[],
): Promise<SessionUser> {
  const user = await requireSession();
  if (!hasAnyPermission(user, required)) redirect("/");
  return user;
}
